"use server";
//?auth.array handles fragments (tagged) not raw stings == FALSE
//?auth.array can escape array values as is == FALSE
//auth`somethign ${value}` treats 'value' as paramterized and 'something' as literal -- must use ${} to be parameterized
//${string} parameterizes string, unless its a tagged template.
//identifiers must be quoted "users"
//auth([values]) also escapes an array of values not just identifier names. based on inference == false

//?auth.array(vals) inserts parenthesis per array (nested arrays have nested parenthesis?)
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { getCookie, validateSession } from "./sessions";

const main = postgres(process.env.MAINDB, {
  ssl: true,
  ws: true,
  debug: (connection, query, parameters) => {
    console.log("SQL:", query);
    console.log("Params:", parameters);
  },
});

const auth = postgres(process.env.AUTHDB, {
  ssl: true,
  ws: true,
  debug: (connection, query, parameters) => {
    console.log("SQL:", query);
    console.log("Params:", parameters);
  },
});

export async function getDb(getTbCount) {
  const rows =
    await main`select schema_name from information_schema.schemata where schema_name not in ('public', 'information_schema', 'pg_catalog', 'pg_toast') order by schema_name`;

  const rowsMetaPromise = rows?.map(async (a, i) => {
    if (getTbCount) {
      const count =
        await main`Select count(table_name) as "tbCount" from information_schema.tables where table_schema = ${a.schema_name} `;
      let dbMeta = await getMetadata({ dbName: a.schema_name });
      // console.log(" getDb, getTbCount: getMetadata", dbMeta);
      return {
        Database: a.schema_name,
        tbCount: count[0].tbCount,
        ...dbMeta,
      };
    } else return { Database: a.schema_name };
  });
  const rowsMeta = await Promise.all(rowsMetaPromise);

  return { rowsMeta };
}

async function checkDb(dbName) {
  const { rowsMeta } = await getDb();
  let dbFound = false;
  for (const { Database } of rowsMeta) {
    if (Database == dbName) {
      dbFound = true;
      break;
    }
  }
  return dbFound;
}

function filterInput(cmt) {
  if (!cmt) return null;
  let input = cmt.replace(";", ".,");
  input = input.replace("--", "- ");
  input = input.replace(`'`, `~`);
  return input.trim();
}

export async function delDb(dbName) {
  const { token32 } = await getCookie();
  if (!token32) return { error: "Unauthorized action" };
  console.log("in delDb dbName: ", dbName, "...token32: ", token32);
  const { edit, level } = await getUserAccess({ dbName, token32 });
  console.log(
    "in delDb, dbName: ",
    dbName,
    " ...edit: ",
    edit,
    " ...level: ",
    level,
  );
  if (!edit && !level && level < 3)
    return { error: "You do not have permission to perform this action" };
  try {
    const res = await main`drop schema ${main(dbName)} cascade`;
    console.log("database deleted from deldb, res: ", res);
    const { error } = await delMetadata({ dbName });
    if (error) {
      console.log("Error deleting metadata: ", error);
    }
    return { error: null };
  } catch (e) {
    console.log("Error in delDb: ", e);
    return { error: "Some error occured." };
  }
}

async function addMetadata({
  //need to update other functions to add metadata info when createtb/db.
  createdBy, //id
  dbName,
  tbName,
  desc,
  isPrivate,
  editors, //[]
  viewers, //[]
  updatedBy,
  newTbName, //for rename table
  newDbName,
}) {
  if (!dbName || (!createdBy && !updatedBy)) return false;
  const prv =
    typeof isPrivate == "boolean" || typeof isPrivate == "number"
      ? isPrivate
        ? true
        : false
      : null;
  const now = new Date();
  const tb = tbName?.trim();
  const ntb = newTbName?.trim();
  const ndb = newDbName?.trim();
  const db = dbName.trim();
  const columns = [
    "db_name",
    tb ? `tb_name` : null,
    editors ? `editors` : null,
    viewers ? `viewers` : null,
    desc ? `description` : null,
    ...(createdBy ? [`created_by`, `created_at`] : []),
    ...(updatedBy ? [`updated_by`, `updated_at`] : []),
    `private`,
  ].filter(Boolean);

  console.log("viewers from addMetadata: ", viewers);
  console.log("editors from addMetadata: ", editors);
  // const values = [
  //   db ? auth`${db}` : ndb ? auth`${ndb}` : "",
  //   tb ? auth`${tb}` : ndb ? auth`${ntb}` : "",
  //   editors ? auth`${editors}` : "",
  //   viewers ? auth`${viewers}` : "",
  //   desc ? auth`${desc}` : "",
  //   createdBy ? auth`${createdBy}` : "",
  //   updatedBy ? auth`${updatedBy}` : "",
  //   now ? auth`${now}` : "",
  //   typeof prv != null ? auth`${prv}` : "",
  // ].filter(Boolean);

  // let valStr = values.reduce(
  //   (agg, val, i) => (i == 0 ? val : auth`${agg}, ${val}`),
  //   auth``,
  // );

  let row =
    await auth`select * from "metadata" where db_name = ${db} and tb_name = ${tb ? tb : null}`;

  if (!row[0]) {
    console.log("in metadata, no row found, db_name: ", db, "..tb_name: ", tb);
    const rawValues = [
      db,
      tb,
      editors,
      viewers,
      desc,
      createdBy,
      updatedBy,
      now,
      prv,
    ].filter((p) => p != undefined && p != null && p != "");

    const values = rawValues.map((v, i) =>
      i != rawValues.length - 1 ? auth`${v},` : auth`${v}`,
    );
    console.log("filtered rawValues from addMetadata: ", rawValues);

    let row2 =
      await auth`Insert into "metadata" (${auth(columns)}) values (${values}) returning *`;
    console.log("row2 from metadata: ", row2);

    if (!row2[0]) return false;
  } else {
    const updWhere = auth`db_name = ${db} and tb_name = ${tb ? tb : null}`; //see if aupwhere works
    const updClause = [];
    console.log("in metadata, row exists");
    if (ndb) updClause.push(auth`db_name = ${ndb}`);
    if (ntb) updClause.push(auth`tb_name = ${ntb}`);
    if (typeof prv == "boolean") updClause.push(auth`private = ${prv}`);
    if (editors) updClause.push(auth`editors = ${editors}`);
    if (viewers) updClause.push(auth`viewers = ${viewers}`);
    if (desc) updClause.push(auth`description = ${desc}`);
    if (createdBy)
      updClause.push(auth`created_by = ${createdBy}, created_at = ${now}`);
    else if (updatedBy)
      updClause.push(auth`updated_by = ${updatedBy}, updated_at = ${now}`);

    let upd = updClause.reduce(
      (agg, val, i) => (i == 0 ? val : auth`${agg}, ${val}`),
      auth``,
    );
    const rowUpd =
      await auth`update "metadata" set ${upd} where ${updWhere} returning *`;
    if (!rowUpd[0]) return false;
  }
  return true;
}

export async function getMetadata({ dbName, tbName, asString }) {
  if (!dbName) {
    console.log({
      message: "Must specify a database to get meta.",
    });
    return null;
  }

  let rowSel =
    await auth`select viewers, editors, created_by, created_at, updated_at, updated_by, private, description from "metadata" where db_name = ${dbName} and ${tbName ? auth`tb_name = ${tbName}` : auth`tb_name is null`}`;
  let viewers;
  let editors;
  // console.log("getMetaData for " + dbName + " rowSel: ", rowSel);
  if (!rowSel.length) {
    console.log({ customMessage: "Metadata not found!" });
    return null;
  }
  // const { name, title } = await checkUser({ userId: row[0].userId });
  if (asString) {
    viewers = rowSel[0].viewers?.join(",");
    editors = rowSel[0].editors?.join(",");
  } else {
    viewers = rowSel[0].viewers;
    editors = rowSel[0].editors;
    // console.log("editots from getMeta: " + JSON.stringify(editors));
    // console.log("viewers from getMeta: " + JSON.stringify(viewers));
  }
  return {
    createdBy: rowSel[0].created_by,
    createdAt: rowSel[0].created_at,
    updatedAt: rowSel[0].updated_at,
    updatedBy: rowSel[0].updated_by,
    description: rowSel[0].description,
    private: rowSel[0].private,
    viewers,
    editors,
  };
}

async function delMetadata({ dbName, tbName }) {
  if (!dbName && !tbName) return { error: "Unauthorized" }; //no db or tb specified
  if (!tbName) {
    if (!(await checkDb(dbName))) {
      return { error: "Database does not exist!" };
    }
  } else if (!(await checkTb({ dbName, tbName }))) {
    return { error: "Table does not exist!" };
  }
  const res =
    await auth`delete from "metadata" where db_name = ${dbName} and ${tbName ? auth`tb_name = ${tbName}` : auth`tb_name is null`} returning *`;
  if (!res[0]) return { error: "Metadata not found!" };
  return { error: null };
}

// async function viewersToArr({ viewers, editors }) { //obsolete
//   // users: [] when null
//   // console.log("begining viewers: " + JSON.stringify(viewers));
//   // console.log("begining editors: " + JSON.stringify(editors));

//   let viewers1 = [];
//   let editors1 = [];

//   function user(id) {
//     return main`select username, firstname, title from user where id = ${id}`;
//   }

//   if (editors) {
//     if (editors.includes(",")) {
//       const editorsArray = editors.split(",");
//       editors1 = editorsArray.map(async (a, i) => {
//         const res = await user(a);
//         // console.log("editors  sql res: " + JSON.stringify(a));
//         if (res.length > 0) {
//           return {
//             username: res[0].username,
//             firstname: res[0].firstname,
//             title: res[0].title,
//             id: a,
//           };
//         }
//       });
//       editors1 = await Promise.all(editors1);
//     } else {
//       const [row] = await main.query(sql, [editors]);
//       if (row.length > 0) {
//         editors1.push({
//           username: row[0].username,
//           firstname: row[0].firstname,
//           title: row[0].title,
//           id: editors,
//         });
//       } else {
//         console.log({
//           message: "User " + a + " has been deleted; But exists in meta",
//         });
//       }
//     }
//   }

//   if (viewers) {
//     const editorArrIndex = editors1.length; //doesnt check for viewers replicates just editors; ensure no repicates
//     if (viewers?.includes(",")) {
//       const viewersArr = viewers.split(",");

//       viewers1 = viewersArr.map(async (a) => {
//         let inEditors = false;
//         if (editorArrIndex > 0) {
//           for (let j = 0; j < editorArrIndex; j++) {
//             if (a == editors1[j].id) {
//               inEditors = true;
//               break;
//             }
//           }
//         }
//         if (!inEditors) {
//           const [res] = await main.query(sql, [a]);
//           if (res.lenth < 1) {
//             console.log({
//               message:
//                 "User does not exist or has been deleted; but exists in meta",
//             });
//           } else
//             return {
//               username: res[0].username,
//               firstname: res[0].firstname,
//               title: res[0].title,
//               id: a,
//             };
//         }
//       });
//       viewers1 = await Promise.all(viewers1);
//     } else {
//       let inEditors = false;
//       if (editorArrIndex > 0) {
//         for (let k = 0; k < editorArrIndex; k++) {
//           if (viewers == editors1[k].id) {
//             inEditors = true;
//             break;
//           }
//         }
//       }
//       if (!inEditors) {
//         const [res] = await main.query(sql, [viewers]);
//         viewers1.push({
//           username: res[0].username,
//           firstname: res[0].firstname,
//           title: res[0].title,
//           id: editors,
//         });
//       }
//     }
//   }
//   viewers1 = viewers1.filter(Boolean);
//   viewers1.length < 1 && (viewers1 = null);
//   editors1.length < 1 && (editors1 = null);
//   // console.log("ending viewers: " + JSON.stringify(viewers1));
//   // console.log("ending editors: " + JSON.stringify(editors1));

//   return { viewers1, editors1 };
// }

export async function getUserAccess({ dbName, tbName, token32, uid }) {
  //ADMIN
  //call for every getTb, getDb, -- must be viewer to view or editor to edit,, extra priviledges for level 3: none
  let none = { level: null, edit: false, view: false, udata: null };
  if (!uid && !token32) return none;

  const { level, userId, title, firstname } = await getSession({
    token32,
    getId: true,
  });
  if (!userId) {
    console.log("Error: getUserAccess, Couldn't get session");
    return none;
  }
  if (!tbName && !(await checkDb(dbName))) {
    console.log("Error: getUserAccess, Db not found");
    throw { customMessage: "Db not found" };
  }
  if (tbName && !(await checkTb({ dbName, tbName }))) {
    console.log("getUserAccess, Tb not found!");
    throw { customMessage: "Table not found" };
  }
  const udata = userId + "&" + title + "&" + firstname;
  // console.log(
  //   "getUserAccess, got past checkUser and getSession, udata: ",
  //   udata,
  // );
  const meta = await getMetadata({
    dbName,
    tbName,
    asString: true,
  });
  console.log("got past getMetadata in getUserAccess, meta: ", meta);
  let edit = false;
  let view = false;
  if (meta) {
    const { createdBy, viewers, editors } = meta;
    if (createdBy?.includes(userId)) {
      edit = true; //change to creator = true?
    } else if (editors?.includes(userId)) {
      edit = true;
    } else if (viewers?.includes(userId)) {
      view = true;
    }
  } else if (level > 1) edit = true;

  console.log(
    "data from get access: edit: ",
    edit,
    "view: ",
    view,
    "level: ",
    level,
  );

  return { edit, view, level, udata };
}

export async function createDb({
  dbName,
  desc,
  viewers,
  editors,
  isPrivate,
  // token32
}) {
  const { token32 } = await getCookie();
  const { firstname, level, userId, title } = await getSession({
    token32,
    getId: true,
  });
  if (!firstname) {
    return {
      error: "User not found! Log in again.",
    };
  } else if (level < 2)
    return {
      error: "You cannot currently perform this action; Contact an admin",
    };

  if (
    dbName == "public" ||
    dbName == "information_schema" ||
    dbName == "pg_catalog" ||
    dbName == "pg_toast"
  )
    return { error: "Reserved name" };
  if (await checkDb(dbName)) return { error: "Database already exists" };
  const res = await main`Create schema ${main(dbName)}`; //will throw own error
  console.log(
    "in createDb got past checkDb!, firstname : ",
    firstname,
    " ..level",
    level,
    "...title: ",
    title,
  );

  const udata = userId + "&" + title + "&" + firstname;
  console.log("in createDb, udata: ", udata);
  const metaAdded = await addMetadata({
    createdBy: udata,
    dbName,
    desc,
    isPrivate,
    editors,
    viewers,
  });
  if (!metaAdded) {
    console.log("Couldnt add metadata, Database will be deleted!");
    const deleted = await delDb(dbName);
  }
  console.log("got past metadata, database success !");

  return { success: true };
}

export async function getTables(dbName, includeMeta) {
  //getUserAccess first
  // tableData = {tbName} | {tbName, ...metadata}
  if (!(await checkDb(dbName))) {
    throw { customMessage: "Database does not exist" };
  }
  const res =
    await main`select table_name as tb from information_schema.tables where table_schema = ${dbName} order by table_name`;
  // console.log("in getTables, res: ", res);
  if (!res[0]) return { error: "Database has no tables" };
  let tableDataPromise = res?.map(async (a, i) => {
    if (includeMeta && a.tb) {
      let rc =
        await main`select count(*) as "rC" from ${main(dbName)}.${main(a.tb)}`;
      let tableMeta = await getMetadata({ dbName, tbName: a.tb });
      // console.log("in getTables, got past getMetadata : ", tableMeta);
      return { tbName: a.tb, rowCount: rc[0].rC, ...tableMeta };
    } else return { tbName: a.tb };
  });
  const tableData = await Promise.all(tableDataPromise); //
  // console.log(JSON.stringify("tableData fr getTables: ", tableData));
  return { tableData };
}

export async function getTbSchema({ dbName, tbName, token32 }) {
  //res: {colName, type, nullable, key}[]   //getUserAccess checks table
  const { edit, view } = await getUserAccess({ dbName, tbName, token32 });
  if (!edit && !view)
    throw { customMessage: "You do not have permission to access this table." };
  //combine with information_schema.key_column_usage to get foreign keys?
  const res =
    await main`select c.column_name as "colName", c.data_type as type, c.is_nullable = 'YES' as nullable, array_agg(tc.constraint_type) filter (where tc.constraint_type is not null) as keys from information_schema.columns c left join information_schema.constraint_column_usage ccu on c.table_name = ccu.table_name and c.table_schema = ccu.table_schema and c.column_name = ccu.column_name left join information_schema.table_constraints tc on ccu.table_name = tc.table_name and ccu.table_schema = tc.table_schema and ccu.constraint_name = tc.constraint_name where c.table_schema = ${dbName} and c.table_name = ${tbName} group by c.column_name, c.data_type, c.is_nullable, c.ordinal_position ORDER BY c.ordinal_position`;
  console.log("in getTbSchema, res: ", res);
  return { schema: res };
}

export async function checkTb({ dbName, tbName }) {
  console.log("checktb dbName: ", dbName, " ...tbName: ", tbName);
  const { tableData } = await getTables(dbName);
  let tbFound = false;
  if (!tableData) return tbFound;
  for (const a of tableData) {
    if (a.tbName == tbName) {
      tbFound = true;
      break;
    }
  }
  return tbFound;
}

export async function createTb({
  dbName,
  tbName,
  columns, //
  desc,
  isPrivate,
  viewers,
  editors,
}) {
  const { token32 } = await getCookie();
  // console.log("in createTb, token32: ", token32, "dbName: ", dbName);
  try {
    const { userId, firstname, title } = await getSession({
      token32,
      getId: true,
    });
    const udata = userId + "&" + title + "&" + firstname;
    // console.log("udata from createTb (got session): ", udata);
    if (await checkTb({ dbName, tbName })) {
      return {
        error: "Table already exists.",
      };
    }
    console.log(
      "in createtb dbName: ",
      dbName,
      "...tbName: ",
      tbName,
      "...columns",
      columns,
      "...udata: ",
      udata,
    );
    if (!columns.length) return { error: "Empty columns " };

    let colArr = [];
    let primaryFound = false;
    const nameCheck = /^[A-Z0-9_£$%&!#]*$/i;
    if (!nameCheck.test(tbName)) return { error: "Not a valid table name" };

    for (const col of columns) {
      //fn to screen value digits for number, etc
      let name = nameCheck.test(col.name)
        ? col.name
        : `Random_name${Math.floor(Math.random() * 1000)}`;
      let type =
        col.type == 2
          ? col.ai
            ? `serial`
            : `real`
          : col.type == 4
            ? `boolean`
            : col.type == 5
              ? `file` // [base64, fileType, fileName, isFile]
              : col.type == 3
                ? `timestamp`
                : `text`;
      let def =
        col.defaultNum && (type == "number" || type == "boolean")
          ? Number(col.def)
          : col.defaultStr && type == "text" && filterInput(col.defaultStr);
      let unique = col.unique ? "unique" : null;
      let primary = !primaryFound && col.primary ? "primary key" : null;
      !primaryFound && col.primary && (primaryFound = true);
      let notnull = col.notnull ? "not null" : null;

      if (col.name && col.type) {
        let colData = main`${main(name)} ${main.unsafe(type)}`;
        unique && (colData = main`${colData} unique`);
        primary && (colData = main`${colData} primary key`);
        notnull && (colData = main`${colData} not null`);
        def && (colData = main`${colData} default ${main`${def}`}`);

        colArr.push(colData);
      }
    }
    //reduce aggretes each entry to the previous adding auth`` each time,
    //columns is an auth`string` which evaluates as a literal
    const cols = colArr.reduce(
      (agg, col, j) => (j == 0 ? col : main`${agg}, ${col}`),
      main``,
    );
    const res =
      await main`create table ${main(dbName)}.${main(tbName)} (${cols}, updated_at timestamp, updated_by text)`;

    console.log("got past create table");
    const metaAdded = await addMetadata({
      createdBy: udata,
      isPrivate,
      dbName,
      tbName,
      desc,
      viewers,
      editors,
    });
    if (!metaAdded) {
      //undo created table
      console.log(
        `metaData not added for database: ${dbName}, table: ${tbName}`,
      );
      return { error: "An error occured." };
    }

    return { error: null };
  } catch (e) {
    console.log("Error in createTb: ", e);
    return { error: "Something went wrong." };
  }
}

export async function changeUsers({
  dbName,
  tbName,
  viewers,
  editors,
  remove,
}) {
  //assumes editor and viewer logic accounts for previous editors/viewers. can implement toViewers/editors/remove independently
  const { token32 } = await getCookie();
  console.log(
    "changeUsers, token32: ",
    token32,
    "...dbName: ",
    dbName,
    "...tbName: ",
    tbName,
    "...viewers: ",
    viewers,
    "...editors: ",
    editors,
  );
  const { edit, udata } = await getUserAccess({ dbName, tbName, token32 });
  if (edit) {
    const metaAdded = await addMetadata({
      updatedBy: udata,
      viewers,
      editors,
      dbName,
      tbName,
    });
    if (!metaAdded) return { error: "An error occured." };
    return { error: null };
  } else return { error: "Unauthorized" };
}

export async function deleteTb({ dbName, tbName, userId }) {
  const { token32 } = await getCookie();
  if (!token32) return { error: "Unauthorized" };
  const { edit, level } = await getUserAccess({ dbName, tbName, token32 });
  if (edit || level > 3) {
    try {
      let del = await main`drop table ${main(dbName)}.${main(tbName)}`;
      return { error: null };
    } catch (e) {
      console.log("Error deleting table: ", e);
      return { error: e.message };
    }
  } else return { error: "You do not have permission to delete this table." };
}

export async function getTbData({ dbName, tbName, orderBy, token32, where }) {
  //do getUserAccess
  // const {tbFound} = await checkTb({dbName: dbName, tbName: tbName})
  // if (!tbFound) throw "Table does not exist"
  //orderby:{col:, order: "asc"}, where:{col: }
  const { userId } = await getSession({ token32, getId: true });
  if (!(await checkTb({ dbName, tbName })))
    throw { customMessage: "Database or table not found!" };
  console.log(
    "in getTbData: dbName: ",
    dbName,
    "tbName: ",
    tbName,
    "orderBy: ",
    orderBy,
  );
  // const orderCol = filterInput(orderBy?.col);
  const order = orderBy?.order.toLowerCase() == "desc" ? "desc" : "asc";
  const whereCol = filterInput(where?.col);
  const whereVal = filterInput(where?.val);
  const res =
    await main`Select * from ${main(dbName)}.${main(tbName)} ${orderBy?.col ? main`order by ${main(orderBy.col)} ${main.unsafe(order)}` : main.unsafe("")} ${whereCol ? main`where ${main(whereCol)} = ${whereVal}` : main.unsafe("")}`;
  console.log("TB data from getTbData: ", JSON.stringify(res));
  return { rows: res };
}

export async function insertTbData({ dbName, tbName, colVals, token32 }) {
  // colVals: {col1:val1, col2:val2}[]

  // already call getUserAccess in gettbSchema but need edit and udata
  const { edit, udata } = await getUserAccess({ dbName, tbName, token32 });
  if (!edit) throw { customMessage: "Unauthorized" };

  if (!(typeof colVals[0] == "object") || !colVals.length) {
    throw {
      customMessage: "Problem parsing the columns; Try reloading the page",
      message: "ColVals in wrong format",
    };
  }
  //get Table meta from schema to optionally create updated_at/by columns
  const { schema } = await getTbSchema({ dbName, tbName, token32 });

  // console.log("in insertTbData, got past getTbSchema, schema: ", schema);
  let updatedAtFound = false;
  let updatedByFound = false;
  const now = new Date();
  for (const { colName } of schema) {
    if (colName.toLowerCase() == "updated_at") updatedAtFound = true;
    if (colName.toLowerCase() == "updated_by") updatedByFound = true;
  }
  // console.log(
  //   "updatedAtFound : ",
  //   updatedAtFound,
  //   " updatedByFound: ",
  //   updatedByFound,
  // );

  if (!updatedAtFound || !updatedByFound) {
    try {
      console.log("trying to alter table in insertTbData");
      let updRes =
        await main`alter table ${main(dbName)}.${main(tbName)} ${!updatedAtFound ? main`add column updated_at timestamp` : main``} ${!updatedByFound ? main.unsafe(`${!updatedAtFound ? "," : ""} add column updated_by text`) : main``}`;
    } catch (e) {
      console.log("error in insertTbData :", e);
      throw {
        customMessage: "metacolumns not found and failed to create them!",
      };
    }
  }

  let colArr = []; //col1, col2
  let multiValArr = []; // (...), (...)
  console.log("in insertTbData, colvals: ", colVals);

  const updatedColVals = colVals.map((a, i) => {
    const updA = {};
    Object.entries(a).forEach((b) => {
      if (b[1].fileData) {
        updA[b[0]] =
          main`ROW(${b[1].fileName}, ${b[1].fileData}, ${b[1].fileType} ) :: file`;
      } else updA[b[0]] = b[1];
    });
    return {
      ...updA,
      ...(!updatedAtFound ? { updated_at: now } : {}),
      ...(!updatedByFound ? { updated_by: udata } : {}),
    };
  });

  // for (const [i, cols] of colVals.entries()) {
  //   console.log("in colVals loop, cols: ", cols);
  //   if (i == 0) {
  //     //can optimize
  //     for (const a of Object.keys(cols)) {
  //       console.log("in cols loop , a: ", a);
  //       //to get column names
  //       colArr.push(main(a));
  //     }
  //   }

  //   const valuesArr = []; //val1, val2, val3
  //   for (const val of Object.values(cols)) {
  //     valuesArr.push(main`${val}`);
  //   }

  //   if (!updatedAtFound) valuesArr.push(main`${now}`);
  //   if (!updatedByFound) colArr.push(main`${udata}`);

  //   const valuesStr = valuesArr.reduce(
  //     (agg, val, i) => {
  //       if (i == 0) return val;
  //       return main`${agg},${val}`;
  //     },
  //     main``,
  //   );

  //   // console.log("````````` After vals loop , values: ", values, "`````````");  //got here
  //   multiValArr.push(main`( ${valuesStr} )`);
  // }

  // if (!updatedAtFound) colArr.push(main("updated_at"));
  // if (!updatedByFound) colArr.push(main("updated_by"));

  // console.log(
  //   "```````` past colvals loop, colArr: ``````````",
  //   colArr,
  //   "`````````",
  // );

  // const multiValsStr = multiValArr.reduce(
  //   (agg, vArr, i) => (i == 0 ? vArr : main`${agg},${vArr}`),
  //   main``,
  // );

  // const colsStr = colArr.reduce(
  //   (agg, col, i) => (i == 0 ? main(col) : main`${agg},${main(col)}`),
  //   main``,
  // );

  console.log("got past valsArrs");
  console.log("in insertTbData, udata: ", udata);

  const res =
    await main`insert into ${main(dbName)}.${main(tbName)} ${main(updatedColVals)} returning *`;

  if (!res[0]) throw { customMessage: "Insert failed" };
  const metaAdded = await addMetadata({ dbName, tbName, updatedBy: udata });
  if (!metaAdded) console.log("Insert table data 'meta' not added");

  return true;
}

export async function updateTbData(dbName, tbName, whereArr, col, val) {
  const { token32 } = await getCookie();
  const { edit, udata } = await getUserAccess({ dbName, tbName, token32 });
  if (!edit) throw { customMessage: "Unauthorized" };

  const col1 = whereArr[0][0];
  const val1 = whereArr[0][1];
  const col2 = whereArr[1][0];
  const val2 = whereArr[1][1];

  console.log(
    "in updateTbData, whereArr: ",
    whereArr,
    " col1: ",
    col1,
    " val1: ",
    val1,
    " col2: ",
    col2,
    " val2: ",
    val2,
  );

  // console.log(
  //   "in updateTbData, whereArr: ",
  //   whereArr,
  //   " col: ",
  //   col,
  //   " val: ",
  //   val,
  //   " edit: ",
  //   edit,
  //   " uData: ",
  //   udata,
  // );

  const res =
    await main`update ${main(dbName)}.${main(tbName)} set ${main(col)} = ${val} where ${main(col1)} = ${val1} and ${main(col2)} = ${val2}`;
  const metaAdded = await addMetadata({ dbName, tbName, updatedBy: udata });
  if (!metaAdded) throw { customMessage: "Meta not added" };

  return true;
}

export async function deleteTbData(dbName, tbName, whereArr) {
  const { token32 } = await getCookie();
  const { edit, udata } = getUserAccess({ dbName, tbName, token32 });
  if (!edit) throw { customMessage: "Unauthorized" };

  const col1 = whereArr[0][0];
  const val1 = whereArr[0][1];
  const col2 = whereArr[1][0];
  const val2 = whereArr[1][1];

  const res =
    await main`delete from ${main(dbName)}.${main(tbName)} where ${main(col1)} = ${val1} and ${main(col2)} = ${val2}`;
  const metaAdded = await addMetadata({ dbName, tbName, updatedBy: udata });
  if (!metaAdded) throw { customMessage: "Meta not added" };

  return true;
}

export async function alterTable({ key, dbName, tbName }) {
  //add column, delete column. -- delete the file_name, file_type columns of a dropped file column
  // rename column
  //change type
}

export async function renameTable({ dbName, tbName, userId, newTbName }) {
  //getUserAccess
  if (!(await checkTb({ dbName, tbName })))
    throw { customMessage: "Unauthorized!" };
  await auth`alter table ${auth(dbName)}.${auth(tbName)} rename to ${newTbName} `;
}

export async function renameSchema({ dbName, userId, newDbName }) {
  //getUserAccess
  if (!(await checkDb(dbName))) throw { customMessage: "Unauthorized!" };
  await auth`alter schema ${auth(dbName)} rename to ${newDbName} `;
}

export async function makeRequests({ dbName, tbName, ReqEdit }) {
  if (!(await checkDb(dbName))) throw { customMessage: "Database not found" };
  console.log("in makeRequests, dbName: ", dbName, " tbName: ", tbName);
  const { token32 } = await getCookie();
  const { userId, firstname, title } = await getSession({
    token32,
    getId: true,
  });
  const uData = userId + "&" + title + "&" + firstname;

  if (!userId || !firstname)
    throw { customMessage: "Couldn't make request; User not found" };

  const { createdBy } = await getMetadata({ dbName, tbName });
  if (!createdBy)
    throw { customMessage: "Couldn't get the database or table's creator" };

  const res =
    await auth`update "metadata" set "edit_requests" = "edit_requests" || ${[uData]} where dbName = ${dbName} ${tbName ? auth`and tbName = ${tbName}` : auth``}`;

  return { error: null };
  // let col = auth`${auth(dbName)}`
  // if (tbName) col += auth`.${auth(tbName)}`
  // const res = auth`insert into ${col} `
}

export async function getRequests({ path }) {
  const { token32 } = await getCookie();
  const { userId, firstname, title } = await getSession({
    token32,
    getId: true,
  });

  if (!userId) throw { customMessage: "Unauthorized" };

  const res = await auth`select view_request, edit_request from `;
  return { error: false };
}

async function searchField() {
  //must be unique or primary
  const values = [tb1, tb2, tb3];
  const row =
    await main`SELECT * FROM db1.users WHERE id IN (${main.array(values, main`, `)})`; //something like it
}

//--------- user auth

export async function getAllUsers(addMeta) {
  //users = {id, title, firstname, lastname, username, level, created{}, views{}, edits{}}
  const allUsers =
    await auth`select id, title, firstname, lastname, username, level from "user" `;
  if (!allUsers[0]) {
    console.log("allUsers HAS NO rows");
    return null;
  }
  console.log("getAllUsers, all users count, :", allUsers.length);

  let users = []; //{created, views, edits} : each: {db:[], tb:[]} : tb: db/tb, db

  if (!addMeta) {
    const meta =
      await auth`select db_name as db, tb_name as tb, created_by as cby, viewers, editors from "metadata"`;
    console.log("getAllUsers, all metadata count, :", meta.length);

    allUsers.forEach((u, i) => {
      const currU = {
        created: { db: [], tb: [] },
        views: { db: [], tb: [] },
        edits: { db: [], tb: [] },
      };

      for (const [j, md] of meta.entries()) {
        if (md.editors?.some((e) => e.includes(u.id))) {
          md.tb
            ? currU.edits.tb.push(md.db + "/" + md.tb)
            : currU.edits.db.push(md.db);
        } else if (md.viewers?.some((v) => v.includes(u.id))) {
          md.tb
            ? currU.views.tb.push(md.db + "/" + md.tb)
            : currU.views.db.push(md.db);
        }
        if (md.cby?.includes(u.id)) {
          md.tb
            ? currU.created.tb.push(md.db + "/" + md.tb)
            : currU.created.db.push(md.db);
        }
      }
      users.push({ ...u, ...currU });
    });
  } else users = allUsers;

  return users;
}

export async function createSession({ userId, dcrPass, token32 }) {
  //when siging up, also when logging in, creates a session or updates the existing one
  const uid = (await checkUser({ userId, password: dcrPass })).userId;
  console.log(
    "uid (userId frm createSession): " + uid + " \n token32: " + token32,
  );
  if (!uid || !token32) return { expiresAt: null };

  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token32)),
  );
  const expAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const deleted = await delSession({ userId });
  const rowIn =
    await auth`insert into "user_session" (id, user_id, expires_at) values (${sessionId}, ${userId}, ${expAt}) returning *`;

  if (!rowIn[0])
    throw {
      customMessage: "User session couldn't be created!",
    };
  return { expiresAt: expAt, token32 };
}

export async function delSession({ userId }) {
  const rowDel =
    await auth`delete from "user_session" where user_id = ${userId} returning *`;
  if (!rowDel[0]) return false;
  return true;
}

export async function updateSession({ sessionId, expires_at }) {
  const rowUpd =
    await auth`update "user_session" set expires_at = ${expires_at} where id = ${sessionId} returning *`;
  console.log("rowUpd from updsession: " + rowUpd);
  if (!rowUpd[0]) return false;
  return true;
}

export async function getSession({ token32, update, getId }) {
  //can onget session with userId
  const sessionId = token32
    ? encodeHexLowerCase(sha256(new TextEncoder().encode(token32)))
    : null;
  let sessionUpdated = false;

  const rowArr = auth`select us.expires_at as "expiresAt", u.username, u.firstname, u.lastname, u.title, u.joined, u.level, u.id as "userId", u.avatar from "user_session" us INNER JOIN "user" u on us.user_id = u.id where us.id = ${sessionId}`;
  let row = await auth`${rowArr}`;
  if (!row[0]) throw { customMessage: "Session does not exist." };

  let rowTime = row[0].expiresAt.getTime();
  if (!rowTime || Date.now() >= rowTime) {
    await delSession({ userId: row[0].userId });
    throw { message: "Session expired!" };
  }

  if (update && Date.now() >= rowTime - 1000 * 60 * 60 * 24 * 3) {
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    if (await updateSession({ sessionId, expires_at })) sessionUpdated = true;
    row = await auth`${rowArr}`;
  }

  const { userId, expiresAt, ...user1 } = row[0];
  let user = user1;
  if (getId) user = { userId, ...user };
  if (update) user = { expiresAt, ...user };
  return user;
}

export async function checkUser({ userId, email, username, password }) {
  //userExists is redundant

  if (!userId && !email && !username) return { userId: null };
  const col = userId ? "id" : email ? "email" : "username";
  let row =
    await auth`select * from "user" where ${auth([col])} = ${userId ? userId : email ? email.toLowerCase() : username}`;
  console.log(
    "got past query in checkUser. email: " + email + "... userid:" + userId,
  );
  console.log("row from checkUser: ", row);
  if (row[0] && password) {
    const samePass = await bcrypt.compare(password.trim(), row[0].password);
    if (samePass) {
      return {
        pass: row[0].password,
        email: row[0].show_email && row[0].email,
        username: row[0].username,
        firstname: row[0].firstname,
        title: row[0].title,
        userId: row[0].id,
        joined: row[0].joined,
        level: row[0].level,
        avatar: row[0].avatar,
        bio: row[0].bio,
      };
    }
  } else if (row[0]) {
    return {
      email: row[0].show_email && row[0].email,
      username: row[0].username,
      firstname: row[0].firstname,
      level: row[0].level,
      avatar: row[0].avatar,
      joined: row[0].joined,
      title: row[0].title,
      bio: row[0].bio,
      userId: row[0].id,
    };
  }
  return { userId: null };
}

async function newUsername({ username }) {
  let newUsername = null;
  function randFn() {
    let num = Math.floor(Math.random() * 10);
    return num;
  }
  for (let i = 0; i < 100; i++) {
    const randNum = [randFn, randFn, randFn];
    let newUname = username + randNum.array("");
    const { userId } = await checkUser({ username: newUname });
    if (!userId) {
      newUsername = newUname;
      break;
    }
  }
  return { newUsername };
}

export async function checkUsername({ username, userId }) {
  //checks username or derives username from first name if username taken or null
  const u = await checkUser({ userId });
  if (!u.userId) throw { customMessage: "Unauthorized" };

  let uName = username || u.firstname;
  let newUname = (await newUsername({ username: uName })).newUsername;
  const newUsername = newUname;

  return { newUsername, username: u.username };
}

export async function createUser({
  firstname,
  lastname,
  email,
  pass,
  token32,
  title,
  gender,
}) {
  //-- will create a function to update username, not here.
  if (!firstname || !lastname || !email || !pass || !token32 || !title)
    throw { customMessage: "Incomplete user credentials" };
  const id = (await checkUser({ email })).userId;
  if (id) throw { customMessage: "Account exists; Login Instead!" }; //userexists
  const userId = uuidv4();
  const hashedPass = await bcrypt.hash(pass, 11);
  const title1 =
    title == 1
      ? "Mr."
      : title == 2
        ? "Ms."
        : title == 3
          ? "Mrs."
          : title == 4
            ? "Dr."
            : "Prof.";
  const gender1 = gender == 1 ? "M" : "F";
  const vals = [
    firstname,
    lastname,
    email.toLowerCase(),
    hashedPass,
    userId,
    title1,
    gender1,
    new Date(),
  ];
  console.log(
    `createUser just before insert executed: fname: ${firstname}... lname:  ${lastname}... email: ${email.toLowerCase()} ... pass: ${hashedPass} ... userId: ${userId} ... title: ${title1} ... gender: ${gender1}  `,
  );

  const valString = vals.reduce(
    (agg, val, i) => (i == 0 ? val : auth`${agg},${val}`),
    auth``,
  );

  const rowIn =
    await auth`insert into "user" (firstname, lastname, email, password, id, title, gender, joined ) values (${valString}) returning *`;
  console.log("createUser insert executed: ", rowIn);
  const { expiresAt } = await createSession({ userId, dcrpass: pass, token32 });
  console.log("got past created session");
  if (!expiresAt.getTime())
    throw {
      customMessage: "Failed to create a session; Registration was sucessful",
    };

  return { expiresAt };
}

// obsolete- cookies will be set and deleted on page
// export async function setSessionCookie({ response, token, expires_at }) {
//   response.cookie("session", token, {
//     httpOnly: true,
//     sameSite: "lax",
//     expires: expires_at.toUTCString(),
//     path: "/",
//     secure: process.env.NODE_ENV == "production",
//   });
//   return true;
// }

// export async function delSessionCookie({ response }) {
//   response.cookie("session", "", {
//     httpOnly: true,
//     sameSite: "lax",
//     path: "/",
//     MaxAge: 0,
//   });
//   return true;
// }

//---------------------------- misc fns
// export async function showSchema() {
//   let sql = "show create table user_session";
//   const [row] = await main.query(sql);
//   console.log(row);
//   return { row };
// }

//alter column name - alter table tbname Rename column clname1 to clname2

//____________ Enctyprion
// can extend for other data much later
// export async function deCryptText(data) {
//   if (typeof data != "string") return null;
//   if (!data.includes("#")) return null;
//   const [ivHex, text] = data.split("#");

//   const key = Buffer.from(process.env.DRC_KEY, "hex");
//   const iv = Buffer.from(ivHex, "hex");
//   const decipher = createDecipheriv("aes-256-cbc", key, iv);
//   let decrypted = decipher.update(text, "hex", "utf8");
//   decrypted += decipher.final("utf8");

//   return decrypted;
// }
