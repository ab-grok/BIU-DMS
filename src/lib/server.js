"use server";
//auth.array handles fragments (tagged) not raw stings
//auth.array can escape array values as is
//postgres(column) for columns, auth`${values}` for values
//auth`somethign ${value}` treats value as paramterized and something as string -- must use ${} to be parameterized
//cant escape a value in the position of an identifier, have postgres(value) for that.
//identifiers must be quoted "users"
//auth.array(vals) inserts parenthesis per array (nested arrays have nested parenthesis?)
import { v4 as uuidv4 } from "uuid";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const main = postgres(process.env.MAINDB);
const auth = postgres(process.env.AUTHDB, {
  debug: (connection, query, parameters) => {
    console.log("SQL:", query);
    console.log("Params:", parameters);
  },
});
export async function getDb(getTbCount) {
  const rows =
    await main`select schema_name from information_schema.schemata where schema_name not in ('pg_catalog', 'information_schema) order by schema_name`;
  const dbWithMeta = [];

  if (getTbCount) {
    const row2 = rows.map(async (a, i) => {
      const count =
        await main`Select count(table_name) as tbCount from information_schema.tables where table_schema = ${a.schema_name} `;
      //console.log(count)
      let dbMeta = await getMetadata({ dbName: a.schema_name });
      dbWithMeta.push({
        Database: a.schema_name,
        tbCount: count.rows[0].tbCount,
        ...dbMeta,
      });
    });
    await Promise.all(row2);
  }
  await main.end();
  return { rows: rows.rows, dbWithMeta };
}

async function checkDb(dbName) {
  const { rows } = await getDb();
  let dbFound = false;
  rows.forEach((a, i) => {
    if (a.schema_name == dbName) {
      dbFound = true;
      return;
    }
  });
  console.log("in dbFound");
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
  //getUser access
  const dbFound = await checkDb(dbName);
  if (!dbFound) {
    throw "database does not exist";
  }
  const res = await main`drop schema ${dbName} cascade`;
  return res;
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
  const updEditors = `${createdBy ? createdBy : ""}${editors ? `,${editors}` : null}`;
  const prv = isPrivate == 0 || false ? false : true;
  const now = new Date();
  const tb = tbName?.trim();
  const ntb = newTbName?.trim();
  const ndb = newDbName?.trim();
  const db = dbName.trim();
  const columns = [
    "db_name",
    `tb_name`,
    updEditors ? `editors` : null,
    viewers ? `viewers` : null,
    desc ? `description` : null,
    createdBy ? `created_by, created_at` : null,
    updatedBy ? `updated_by, updated_at` : null,
    `private`,
  ].filter(Boolean);

  const values = [
    db ? db : ndb ? ndb : "",
    tb ? tb : ntb ? ntb : "",
    updEditors ? updEditors : "",
    viewers ? viewers : "",
    desc ? desc : "",
    createdBy ? createdBy : "",
    updatedBy ? updatedBy : "",
    now ? now : "",
    prv ? prv : "",
  ].filter(Boolean);

  const updWhere = [auth`db_name = ${db} and tb_name = ${tb ? tb : ""}`];

  let row =
    await await auth`select * from metadata where db_name = ${db} and tb_name = ${tb ? tb : ""}`;

  if (!row.rowCount) {
    let row2 =
      await auth`Insert into "metadata" (${auth.raw(columns.join(","))}) values (${auth.array(values)})`;
    if (!row2.count) return false;
  } else {
    const updClause = [];
    if (db || ndb) updClause.push(auth`db_name = ${db ? db : ndb}`);
    if (tb || ntb) updClause.push(auth`tb_name = ${tb ? tb : ntb}`);
    if (prv) updClause.push(auth`private = ${prv}`);
    if (updEditors) updClause.push(auth`editors = editors || ${updEditors}`);
    if (viewers) updClause.push(auth`viewers = viewers || ${viewers}`);
    if (desc) updClause.push(auth`description = ${desc}`);
    if (createdBy)
      updClause.push(auth`created_by = ${createdBy}, created_at = ${now}`);
    else if (updatedBy)
      updClause.push(auth`updated_by = ${updatedBy}, updated_at = ${now}`);

    const rowUpd =
      await auth`update metadata set ${auth.array(updClause)} where ${auth.array(updWhere)}`;
    if (rowUpd.rowCount < 1) return false;
  }
  return true;
}

export async function getMetadata({ dbName, tbName, asString }) {
  if (!dbName) {
    console.log({
      message: "Must specify a database to get meta.",
    });
    return;
  }

  let rowSel =
    await auth`select viewers, editors, created_by, created_at, updated_at, updated_by, private, description from metadata where db_name = ${dbName} and tb_name = ${tbName ? tbName : null}`;
  let viewers;
  let editors;

  if (rowSel.rowCount < 1) {
    console.log({ customMessage: "Metadata not found!" });
    return null;
  }
  // const { name, title } = await checkUser({ userId: row[0].userId });
  if (asString) {
    viewers = rowSel.rows[0].viewers.join(",");
    editors = rowSel.rows[0].editors.join(",");
  } else {
    viewers = rowSel.rows[0].viewers;
    editors = rowSel.rows[0].editors;
    // console.log("editots from getMeta: " + JSON.stringify(editors));
    // console.log("viewers from getMeta: " + JSON.stringify(viewers));
  }
  return {
    createdBy: rowSel.rows[0].created_by,
    createdAt: rowSel.rows[0].created_at,
    updatedAt: rowSel.rows[0].updated_at,
    updatedBy: rowSel.rows[0].updated_by,
    description: rowSel.rows[0].description,
    private: rowSel.rows[0].private,
    viewers,
    editors,
  };
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
//         if (res.rows.length > 0) {
//           return {
//             username: res.rows[0].username,
//             firstname: res.rows[0].firstname,
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

//   await main.end();
//   return { viewers1, editors1 };
// }

async function getUserAccess({ dbName, tbName, userId }) {
  //ADMIN
  //call for every getTb, getDb, -- must be viewer to view or editor to edit,, extra priviledges for level 3: none
  if (!userId || !dbName)
    throw {
      customMessage: "Only granted users can access this database or table.",
    };
  if (!(await checkDb())) {
    console.log("Db not found");
    return false;
  }
  if (!(await checkTb())) {
    console.log("Tb not found!");
    return false;
  }
  const { createdBy, viewers, editors } = await getMetadata({
    dbName,
    tbName,
    asString: true,
  });
  let edit = false;
  let view = false;
  if (createdBy.includes(userId.trim())) {
    edit = true;
  } else if (editors.includes(userId)) {
    edit = true;
  } else if (viewers.includes(userId)) {
    view = true;
  }
  // if (level > 2) {
  //   if (!tbName)
  //   view = true;
  // }
  await main.end();
  return { edit, view };
}

export async function createDb({
  userId,
  dbName,
  desc,
  viewers,
  editors,
  isPrivate,
}) {
  const { email, level } = await checkUser({ userId });
  if (!email) {
    throw {
      customMessage: "User not found! Log in again.",
    };
  } else if (level < 2)
    throw {
      customMessage:
        "You cannot currently perform this action; Contact an admin",
    };

  if (await checkDb(dbName)) throw { customMessage: "Database already exists" };
  const res = await main`Create schema ${dbName}`; //will throw own error

  const metaAdded = await addMetadata({
    createdBy: userId,
    dbName,
    desc,
    isPrivate,
    editors,
    viewers,
  });
  if (!metaAdded)
    console.log("Couldnt add metadata, Database will be deleted!");
  return true;
}

export async function getTables(dbName, includeMeta) {
  //must call with includeMeta to get table metadata
  // tableData = {tbName} | {tbName, ...metadata}
  if (!(await checkDb(dbName))) {
    throw { customMessage: "Database does not exist" };
  }
  const main = mainDb(dbName);
  const res = main`select table_name as tb from information_schema.tables where table_schema = ${dbName} order by table_name`;

  let tableDataPromise = res.rows.map(async (a, i) => {
    if (includeMeta) {
      let rc = await main`select count(*) as rC from ${main([dbName, a.tb])}`;
      let tableMeta = await getMetadata({ dbName, tbName: a.tb });
      return { tbName: a.tb, rowCount: rc.rows[0].rC, ...tableMeta };
    } else return { tbName: a.tb };
  });
  const tableData = await Promise.all(tableDataPromise); //
  // console.log(JSON.stringify(tables));
  await main.end();
  return { tableData };
}

export async function getTbSchema({ dbName, tbName }) {
  //res: {colName, type, nullable, key}[]
  const tbFound = await checkTb({ dbName, tbName });
  if (!tbFound) throw { customMessage: "Couldn't find the table or database" };
  //combine with information_schema.key_column_usage to get foreign keys?
  const res =
    await main`select c.column_name as colName, c.data_type as type, c.is_nullable as nullable, arr.agg(tc.constraint_type) filter (where tc.constraint_type is not null) as keys from information_schema.columns left array information_schema.constraint_column_usage ccu on c.table_name = ccu.table_name and c.table_schema = ccu.table_schema and c.column_name = ccu.column_name left array information_schema.table_constraints tc on ccu.table_name = tc.table_name and ccu.table_schema = tc.table_schema and ccu.constraint_name = tc.constraint_name where c.table_schema = ${dbName} and c.table_name = ${tbName} group by c.column_name, c.data_type, c.is_nullable ORDER BY c.ordinal_position`;
  await main.end();
  return { tableMeta: res.rows };
}

export async function checkTb({ dbName, tbName }) {
  console.log("dbname from checktb: " + dbName);
  const { tableData } = await getTables(dbName);
  let tbFound = false;
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
  userId,
  isPrivate,
  viewers,
  editors,
}) {
  if (!(await checkDb(dbName))) throw { customMessage: `Unauthorized action` };
  if (await checkTb({ dbName, tbName })) {
    throw {
      customMessage: "Table already exists.",
    };
  }
  if (!columns.length) throw { customMessage: "Empty columns" };

  let colArr = [];
  let primaryFound = false;
  const nameCheck = /^[A-Z0-9_£$%&!#]*$/i;
  if (!nameCheck.test(tbName)) throw { message: "Not a valid table name" };

  for (const col of columns) {
    //fn to screen value digits for number, etc
    let name = nameCheck.test(col.name)
      ? col.name
      : `Random_name${Math.floor(Math.random() * 1000)}`;
    let type =
      col.type == "number"
        ? col.ai
          ? `integer`
          : `real`
        : col.type == "boolean"
          ? `boolean`
          : col.type == "file"
            ? `bytea`
            : col.type == "date"
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
      let colData = main`${main(name)} ${auth.raw(type)}`;
      unique && (colData = main`${colData} unique`);
      primary && (colData = main`${colData} primary key`);
      notnull && (colData = main`${colData} not null`);
      def && (colData = main`${colData} default ${def}`);

      colArr.push(colData);
    }
  }
  //reduce aggretes each entry to the previous adding auth`` each time,
  //columns is an auth`string` which evaluates as a literal
  const cols = colArr.reduce(
    (agg, col, j) => (j == 0 ? col : auth`${agg}, ${col}`),
    auth``,
  );
  const res =
    await main`create table ${main([dbName, tbName])} (${cols}, updated_at timestamp, updated_by text)`;

  await main.end();
  const metaAdded = await addMetadata({
    userId,
    isPrivate,
    dbName,
    tbName,
    desc,
    viewers,
    editors,
  });
  if (!metaAdded) {
    //undo created table
    console.log(`metaData not added for database: ${dbName}, table: ${tbName}`);
    throw { customMessage: "An error occured." };
  }

  console.log("sql from createTb: ", sql);

  return true;
}

export async function getTbData({ dbName, tbName, orderBy, userId, where }) {
  //do getUserAccess
  // const {tbFound} = await checkTb({dbName: dbName, tbName: tbName})
  // if (!tbFound) throw "Table does not exist"
  //orderby:{col:, order: "asc"}, where:{col: }
  if (!(await checkTb({ dbName, tbName })))
    throw { customMessage: "Database or table not found!" };

  const orderCol = filterInput(orderBy?.col);
  const order = orderBy?.order.toLowerCase() == "desc" ? "desc" : "asc";
  const whereCol = filterInput(where?.col);
  const whereVal = filterInput(where?.val);
  const res =
    await main`Select * from ${main([dbName, tbName])} ${orderCol ? main`order by ${main(orderCol)} ${main.raw(order)}` : main.raw("")} ${whereCol ? main`where ${main(whereCol)} = ${whereVal}` : main.raw("")}`;
  console.log("TB data from getTBData: ", JSON.stringify(res.rows));
  if (!res.rowCount) console.log({ customMessage: "No table data exists" });
  return { rows: res.rows };
}

export async function insertData({ dbName, tbName, colVals, userId }) {
  // colVals: {col1:val1}[]
  //getUserAccess

  if (!(await checkTb({ tbName, dbName })))
    throw { customMessage: "Database or table not found" };
  if (!(await checkUser({ userId })).userId)
    throw { customMessage: "Unauthorized" };

  console.log("in insertData, db, tb and userId found");
  if (!(typeof colVals[0] == "object") || !colVals.length) {
    throw {
      customMessage: "Problem parsing the columns; Try reloading the page",
      message: "ColVals in wrong format",
    };
  }

  //get Table meta to optionally create updated_at/by columns
  const { tableMeta } = await getTbSchema({ dbName, tbName });
  const now = new Date();
  let updatedAtFound = false;
  let updatedByFound = false;
  for (const a of tableMeta) {
    if (a.colName.toLowerCase() == "updated_at") updatedAtFound = true;
    if (a.colName.toLowerCase() == "updated_by") updatedByFound = true;
    if (updatedAtFound && updatedByFound) break;
  }

  if (!updatedAtFound || !updatedByFound) {
    try {
      let updRes =
        await main`alter table ${main([dbName, tbName])} ${!updatedAtFound ? main.raw("add column updated_at timestamp") : main.raw("")} ${!updatedByFound ? main.raw(`${!updatedAtFound ? "," : ""} add column updated_by text`) : main.raw("")}`;
    } catch (e) {
      throw {
        customMessage: "metacolumns not found and failed to create them!",
      };
    }
  }

  let colArr = []; //col1,col2
  let valuesArr = []; // (...), (...)

  for (const [i, cols] of colVals.entries()) {
    if (i == 0) {
      //can optimize
      for (const a of Object.keys(cols)) {
        //to get column names
        if (!a) break;
        colArr.push(main`${main(a)}`);
      }
    }

    const values = []; //val1, val2, val3
    for (const val of Object.values(cols)) {
      if (!val) break;
      values.push(main`${val}`);
    }
    valuesArr.push(main`(${main.array(values)}, ${now}, ${userId} )`);
  }

  const colnames = colArr.reduce(
    (agg, col, i) => (i == 0 ? col : main`${agg},${col}`),
    main``,
  );
  const res =
    await main`insert into ${main([dbName, tbName])} (${colnames}, updated_at, updated_by) values ${main.array(valuesArr)}`;

  if (!res.rowCount) throw { customMessage: "insert failed" };
  const metaAdded = await addMetadata({ dbName, tbName, updatedBy: userId });
  if (!metaAdded) console.log("insertData meta not added");

  await main.end();
  return true;
}

export async function alterTable({ key, dbName, tbName }) {
  //add column, delete column.
  // rename column
  //change type
}

export async function renameTable({ dbName, tbName, userId, newTbName }) {
  //getUserAccess
  if (!(await checkTb({ dbName, tbName })))
    throw { customMessage: "Unauthorized!" };
  await auth`alter table ${postgres([dbName, tbName])} rename to ${newTbName} `;
}

export async function renameSchema({ dbName, userId, newDbName }) {
  //getUserAccess
  if (!(await checkDb(dbName))) throw { customMessage: "Unauthorized!" };
  await auth`alter schema ${postgres([dbName])} rename to ${newDbName} `;
}

async function searchField() {
  //must be unique or primary
  const values = [tb1, tb2, tb3];
  const row =
    await main`SELECT * FROM db1.users WHERE id IN (${main.array(values, main`, `)})`; //something like it
}

//--------- user auth

export async function getAllUsers() {
  //users = {id, title, firstname, lastname, username, level, created{}, views{}, edits{}}
  const allUsers =
    await auth`select id, title, firstname, lastname, username, level from user `;
  if (!allUsers.rowCount) {
    console.log("allUsers HAS NO rows");
    return null;
  }

  const users = []; //{created, views, edits} : each: {db:[], tb:[]} : tb: db/tb, db

  const meta =
    await auth`select db_name as db, tb_name as tb, created_by as cby, viewers, editors from metadata`;
  allUsers.rows.forEach((u, i) => {
    const currU = {
      created: { db: [], tb: [] },
      views: { db: [], tb: [] },
      edits: { db: [], tb: [] },
    };

    for (const [j, md] of meta.rows.entries()) {
      if (md.editors.includes(u.id)) {
        md.tb
          ? currU.edits.tb.push(md.db + "/" + md.tb)
          : currU.edits.db.push(md.db);
      } else if (md.viewers.includes(u.id)) {
        md.tb
          ? currU.views.tb.push(md.db + "/" + md.tb)
          : currU.views.db.push(md.db);
      }
      if (md.cby.includes(u.id)) {
        md.tb
          ? currU.created.tb.push(md.db + "/" + md.tb)
          : currU.created.db.push(md.db);
      }
    }
    users.push({ ...u, currU });
  });

  return users;
}

export async function createSession({ userId, dcrPass, token32 }) {
  //when siging up, also when logging in, creates a session or updates the existing one
  const uid = (await checkUser({ userId, password: dcrPass })).userId;
  console.log(
    "uid (userId frm createSession): " + uid + " \n token32: " + token32,
  );
  if (!uid || !token32) return { expiresAt: null };

  console.log("dcrPass from createSession: " + dcrPass);
  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token32)),
  );
  const expAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const deleted = await delSession({ userId });
  const rowIn =
    await auth`insert into "user_session" (id, user_id, expires_at) values (${sessionId}, ${userId}, ${expAt})`;
  if (!rowIn.rowCount)
    throw {
      customMessage:
        "User session couldn't be created. You'll have to log in again!",
    };
  return { expiresAt: expAt, token32 };
}

export async function delSession({ userId }) {
  const rowDel = await auth`delete from user_session where user_id = ${userId}`;
  if (!rowDel.rowCount) return false;
  return true;
}

export async function updateSession({ sessionId, expires_at }) {
  const rowUpd =
    await auth`update user_session set expires_at = ${expires_at} where id = ${sessionId}`;
  console.log("rowUpd from updsession: " + rowUpd);
  if (!rowUpd.rowCount) return false;
  return true;
}

export async function getSession({ token32, update, getId }) {
  //can onget session with userId
  const sessionId = token32
    ? encodeHexLowerCase(sha256(new TextEncoder().encode(token32)))
    : null;
  let sessionUpdated = false;
  const rowArr = auth`select user_session.expires_at as expiresAt, user.username, user.firstname, user.lastname, user.title, user.joined, user.level, user.id as userId, user.avatar_url as avatarUrl from user_session INNER JOIN user on user_session.user_id = user.id where user_session.id = ${sessionId}`;
  let row = auth`${rowArr}`;
  if (!row.rowCount) throw { customMessage: "Session does not exist." };

  let rowTime = row.rows[0].expiresAt.getTime();
  console.log("GetSession Session exists. RowTime.getTime():  ", rowTime);
  console.log(
    "GetSession Session exists. row.rows[0].expires_at:  ",
    row.rows[0].expiresAt,
  );

  if (!rowTime || Date.now() >= rowTime) {
    await delSession({ userId: row[0].userId });
    throw { message: "Session expired!" };
  }

  if (update && Date.now() >= rowTime - 1000 * 60 * 60 * 24 * 3) {
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    if (await updateSession({ sessionId, expires_at })) sessionUpdated = true;
    row = auth`${rowArr}`;
  }

  const { userId, expiresAt, ...user1 } = row.rows[0];
  let user = user1;
  if (getId) user = { userId, ...user1 };
  if (update && sessionUpdated) user = { expiresAt, ...user1 };

  return user;
}

export async function checkUser({ userId, email, username, password }) {
  //userExists is redundant

  if (!userId && !email && !username) return { userId: null };
  const col = userId ? `id` : email ? `email` : `username`;
  let row =
    await auth`select * from public.user where ${postgres([col])} = ${userId ? userId : email ? email : username}`;
  console.log("got past query in checkUser. email: " + email);
  if (row.rowCount && password) {
    const samePass = await bcrypt.compare(
      password.trim(),
      row.rows[0].password,
    );
    if (samePass) {
      return {
        pass: row.rows[0].password,
        email: row.rows[0].show_email && row.rows[0].email,
        username: row.rows[0].username,
        firstname: row.rows[0].firstname,
        title: row.rows[0].title,
        userId: row.rows[0].id,
        joined: row.rows[0].joined,
        level: row.rows[0].level,
        avatarUrl: row.rows[0].avatar_url,
        bio: row.rows[0].bio,
      };
    }
  } else if (row.rowCount) {
    return {
      email: row.rows[0].show_email && row.rows[0].email,
      username: row.rows[0].username,
      firstname: row.rows[0].firstname,
      level: row.rows[0].level,
      avatarUrl: row.rows[0].avatar_url,
      joined: row.rows[0].joined,
      title: row.rows[0].title,
      bio: row.rows[0].bio,
      userId: row.rows[0].id,
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
  ];
  console.log(
    `createUser just before insert executed: fname: ${firstname}... lname:  ${lastname}... email: ${email.toLowerCase()} ... pass: ${hashedPass} ... userId: ${userId} ... title: ${title1} ... gender: ${gender1}  `,
  );
  const rowIn =
    await auth`insert into "user" (firstname, lastname, email, password, id, title, gender ) values ${auth.array(vals)}`;
  console.log("createUser insert executed ");
  console.log(rowIn);
  if (!rowIn.rowCount) throw { message: "Some error occured." };

  const { expiresAt } = await createSession({ userId, dcrpass: pass, token32 });
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
