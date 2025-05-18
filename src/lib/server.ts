// "use server";
// /**
//  * Database query functions for multi-tenant Next.js app with Neon PostgreSQL.
//  * Changes:
//  * - Converted to TypeScript with type definitions for parameters and outputs.
//  * - Removed manual `end()` calls, using connection pooling.
//  * - Added SSL for Neon in `mainDb` and `authDb`.
//  * - Fixed `description` typo, `datetime` to `timestamp`, `ALTER SCHEMA`.
//  * - Used `IS NULL` for `tb_name` checks.
//  * - Added try-catch and logging for error tracing.
//  * - Simplified fragment composition with comments.
//  */

// import { v4 as uuidv4 } from "uuid";
// import { sha256 } from "@oslojs/crypto/sha2";
// import { encodeHexLowerCase } from "@oslojs/encoding";
// import bcrypt from "bcryptjs";
// import postgres, { Sql } from "postgres";

// // Interfaces for database schema
// interface User {
//   userId: string;
//   email?: string;
//   username?: string;
//   firstname?: string;
//   title?: string;
//   joined?: Date;
//   level?: number;
//   avatarUrl?: string;
//   bio?: string;
//   pass?: string;
// }

// interface Metadata {
//   createdBy: string;
//   createdAt: Date;
//   updatedAt?: Date;
//   updatedBy?: string;
//   description?: string;
//   private: boolean;
//   viewers: string[] | string;
//   editors: string[] | string;
// }

// interface ColumnDef {
//   name: string;
//   type: "number" | "boolean" | "file" | "date" | "text";
//   ai?: boolean;
//   unique?: boolean;
//   primary?: boolean;
//   notnull?: boolean;
//   defaultNum?: number;
//   defaultStr?: string;
// }

// interface TableSchema {
//   colName: string;
//   type: string;
//   nullable: string;
//   keys?: string[];
// }

// // Database connections
// const mainDb: Sql = postgres(process.env.MAINDB!, {
//   ssl: { rejectUnauthorized: false },
// });
// const authDb: Sql = postgres(process.env.AUTHDB!, {
//   ssl: { rejectUnauthorized: false },
// });

// // Log connection strings for debugging
// console.log('MAINDB:', process.env.MAINDB);
// console.log('AUTHDB:', process.env.AUTHDB);

// /**
//  * Retrieves all databases with optional table counts and metadata.
//  * @param getTbCount Include table counts and metadata.
//  * @returns Databases and metadata.
//  */
// async function getDb(getTbCount: boolean = false): Promise<{
//   rows: { schema_name: string }[];
//   dbWithMeta: { Database: string; tbCount: number; [key: string]: any }[];
// }> {
//   try {
//     const rows = await mainDb`select schema_name from information_schema.schemata where schema_name not in ('pg_catalog', 'information_schema') order by schema_name`;
//     const dbWithMeta: { Database: string; tbCount: number; [key: string]: any }[] = [];

//     if (getTbCount) {
//       const rowPromises = rows.map(async (a) => {
//         const count = await mainDb`Select count(table_name) as tbCount from information_schema.tables where table_schema = ${a.schema_name}`;
//         const dbMeta = await getMetadata({ dbName: a.schema_name });
//         dbWithMeta.push({
//           Database: a.schema_name,
//           tbCount: count[0].tbCount,
//           ...dbMeta,
//         });
//       });
//       const dbs = await Promise.all(rowPromises);
//     }
//     return { rows, dbWithMeta };
//   } catch (err) {
//     console.error('getDb error:', err);
//     throw err;
//   }
// }

// /**
//  * Checks if a database exists.
//  * @param dbName Database name.
//  * @returns True if database exists.
//  */
// async function checkDb(dbName: string): Promise<boolean> {
//   try {
//     const { rows } = await getDb();
//     return rows.some((a) => a.schema_name === dbName);
//   } catch (err) {
//     console.error('checkDb error:', err);
//     throw err;
//   }
// }

// /**
//  * Sanitizes input to prevent SQL injection.
//  * @param cmt Input string.
//  * @returns Sanitized string or null.
//  */
// function filterInput(cmt: string | null): string | null {
//   if (!cmt) return null;
//   let input = cmt.replace(";", ".,").replace("--", "- ").replace(`'`, `~`);
//   return input.trim();
// }

// /**
//  * Deletes a database schema.
//  * @param dbName Database name.
//  * @returns Query result.
//  */
// export async function delDb(dbName: string): Promise<any> {
//   try {
//     const dbFound = await checkDb(dbName);
//     if (!dbFound) throw new Error("Database does not exist");
//     return await mainDb`drop schema ${mainDb(dbName)} cascade`;
//   } catch (err) {
//     console.error('delDb error:', err);
//     throw err;
//   }
// }

// /**
//  * Adds or updates metadata for a database or table.
//  * @param params Metadata parameters.
//  * @returns True if successful.
//  */
// async function addMetadata({
//   createdBy,
//   dbName,
//   tbName,
//   desc,
//   isPrivate,
//   editors,
//   viewers,
//   updatedBy,
//   newTbName,
//   newDbName,
// }: {
//   createdBy?: string;
//   dbName: string;
//   tbName?: string;
//   desc?: string;
//   isPrivate?: boolean;
//   editors?: string;
//   viewers?: string;
//   updatedBy?: string;
//   newTbName?: string;
//   newDbName?: string;
// }): Promise<boolean> {
//   try {
//     if (!dbName || (!createdBy && !updatedBy)) return false;
//     const updEditors = `${createdBy || ""}${editors ? `,${editors}` : ""}`;
//     const prv = isPrivate ?? false;
//     const now = new Date();
//     const tb = tbName?.trim();
//     const ntb = newTbName?.trim();
//     const ndb = newDbName?.trim();
//     const db = dbName.trim();

//     const columns = [
//       "db_name",
//       tb || ntb ? `tb_name` : null,
//       updEditors ? `editors` : null,
//       viewers ? `viewers` : null,
//       desc ? `description` : null,
//       createdBy ? `created_by, created_at` : null,
//       updatedBy ? `updated_by, updated_at` : null,
//       `private`,
//     ].filter(Boolean);

//     const values = [
//       db || ndb || "",
//       tb || ntb || "",
//       updEditors || "",
//       viewers || "",
//       desc || "",
//       createdBy || "",
//       updatedBy || "",
//       now,
//       prv,
//     ].filter(Boolean);

//     const whereClause = authDb`db_name = ${db} ${tb ? authDb`and tb_name = ${tb}` : authDb`and tb_name IS NULL`}`;
//     const row = await authDb`select * from metadata where ${whereClause}`;

//     if (!row.length) {
//       const row2 = await authDb`Insert into metadata (${authDb.raw(columns.join(","))}) values (${authDb.array(values)})`;
//       return !!row2.count;
//     } else {
//       const updClause = [];
//       if (db || ndb) updClause.push(authDb`db_name = ${db || ndb}`);
//       if (tb || ntb) updClause.push(authDb`tb_name = ${tb || ntb}`);
//       if (prv) updClause.push(authDb`private = ${prv}`);
//       if (updEditors) updClause.push(authDb`editors = editors || ${updEditors}`);
//       if (viewers) updClause.push(authDb`viewers = viewers || ${viewers}`);
//       if (desc) updClause.push(authDb`description = ${desc}`);
//       if (createdBy) updClause.push(authDb`created_by = ${createdBy}, created_at = ${now}`);
//       else if (updatedBy) updClause.push(authDb`updated_by = ${updatedBy}, updated_at = ${now}`);

//       const rowUpd = await authDb`update metadata set ${authDb.array(updClause)} where ${whereClause}`;
//       return rowUpd.count > 0;
//     }
//   } catch (err) {
//     console.error('addMetadata error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves metadata for a database or table.
//  * @param params Metadata parameters.
//  * @returns Metadata or null.
//  */
// export async function getMetadata({
//   dbName,
//   tbName,
//   asString,
// }: {
//   dbName: string;
//   tbName?: string;
//   asString?: boolean;
// }): Promise<Metadata | null> {
//   try {
//     if (!dbName) {
//       console.log({ message: "Must specify a database to get meta." });
//       return null;
//     }

//     const whereClause = authDb`db_name = ${dbName} ${tbName ? authDb`and tb_name = ${tbName}` : authDb`and tb_name IS NULL`}`;
//     const row = await authDb`select viewers, editors, created_by, created_at, updated_at, updated_by, private, description from metadata where ${whereClause}`;

//     if (!row.length) {
//       console.log({ customMessage: "Metadata not found!" });
//       return null;
//     }

//     const viewers = asString ? row[0].viewers.join(",") : row[0].viewers;
//     const editors = asString ? row[0].editors.join(",") : row[0].editors;

//     return {
//       createdBy: row[0].created_by,
//       createdAt: row[0].created_at,
//       updatedAt: row[0].updated_at,
//       updatedBy: row[0].updated_by,
//       description: row[0].description, // Fixed typo: desciption → description
//       private: row[0].private,
//       viewers,
//       editors,
//     };
//   } catch (err) {
//     console.error('getMetadata error:', err);
//     throw err;
//   }
// }

// /**
//  * Checks user access to a database or table.
//  * @param params Access parameters.
//  * @returns Edit and view permissions.
//  */
// async function getUserAccess({
//   dbName,
//   tbName,
//   userId,
// }: {
//   dbName: string;
//   tbName?: string;
//   userId: string;
// }): Promise<{ edit: boolean; view: boolean }> {
//   try {
//     if (!userId || !dbName) {
//       throw { customMessage: "Only granted users can access this database or table." };
//     }
//     if (!(await checkDb(dbName))) {
//       console.log("Db not found");
//       return { edit: false, view: false };
//     }
//     if (tbName && !(await checkTb({ dbName, tbName }))) {
//       console.log("Tb not found!");
//       return { edit: false, view: false };
//     }

//     const metadata = await getMetadata({ dbName, tbName, asString: true });
//     if (!metadata) return { edit: false, view: false };

//     const { createdBy, viewers, editors } = metadata;
//     const edit = createdBy.includes(userId.trim()) || (editors as string).includes(userId);
//     const view = edit || (viewers as string).includes(userId);

//     return { edit, view };
//   } catch (err) {
//     console.error('getUserAccess error:', err);
//     throw err;
//   }
// }

// /**
//  * Creates a database schema.
//  * @param params Database parameters.
//  * @returns True if successful.
//  */
// export async function createDb({
//   userId,
//   dbName,
//   desc,
//   viewers,
//   editors,
//   isPrivate,
// }: {
//   userId: string;
//   dbName: string;
//   desc?: string;
//   viewers?: string;
//   editors?: string;
//   isPrivate?: boolean;
// }): Promise<boolean> {
//   try {
//     const { email, level } = await checkUser({ userId });
//     if (!email) throw { customMessage: "User not found! Log in again." };
//     if (level < 2) throw { customMessage: "You cannot currently perform this action; Contact an admin" };

//     if (await checkDb(dbName)) throw { customMessage: "Database already exists" };
//     await mainDb`Create schema ${mainDb(dbName)}`;

//     const metaAdded = await addMetadata({ createdBy: userId, dbName, desc, isPrivate, editors, viewers });
//     if (!metaAdded) {
//       console.log("Couldn’t add metadata, Database will be deleted!");
//       await delDb(dbName);
//       return false;
//     }
//     return true;
//   } catch (err) {
//     console.error('createDb error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves tables in a database.
//  * @param dbName Database name.
//  * @param includeMeta Include metadata.
//  * @returns Table data.
//  */
// export async function getTables(
//   dbName: string,
//   includeMeta: boolean = false,
// ): Promise<{ tableData: { tbName: string; rowCount?: number; [key: string]: any }[] }> {
//   try {
//     if (!(await checkDb(dbName))) throw { customMessage: "Database does not exist" };
//     const res = await mainDb`select table_name as tb from information_schema.tables where table_schema = ${dbName} order by table_name`;

//     const tableDataPromises = res.map(async (a) => {
//       if (includeMeta) {
//         const rc = await mainDb`select count(*) as rC from ${mainDb([dbName, a.tb])}`;
//         const tableMeta = await getMetadata({ dbName, tbName: a.tb });
//         return { tbName: a.tb, rowCount: rc[0].rC, ...tableMeta };
//       }
//       return { tbName: a.tb };
//     });
//     const tableData = await Promise.all(tableDataPromises);
//     return { tableData };
//   } catch (err) {
//     console.error('getTables error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves table schema.
//  * @param params Table parameters.
//  * @returns Table metadata.
//  */
// export async function getTbSchema({
//   dbName,
//   tbName,
// }: {
//   dbName: string;
//   tbName: string;
// }): Promise<{ tableMeta: TableSchema[] }> {
//   try {
//     const tbFound = await checkTb({ dbName, tbName });
//     if (!tbFound) throw { customMessage: "Couldn’t find the table or database" };
//     const res = await mainDb`
//       select
//         c.column_name as colName,
//         c.data_type as type,
//         c.is_nullable as nullable,
//         array_agg(tc.constraint_type) filter (where tc.constraint_type is not null) as keys
//       from information_schema.columns c
//       left join information_schema.constraint_column_usage ccu
//         on c.table_name = ccu.table_name and c.table_schema = ccu.table_schema and c.column_name = ccu.column_name
//       left join information_schema.table_constraints tc
//         on ccu.table_name = tc.table_name and ccu.table_schema = tc.table_schema and ccu.constraint_name = tc.constraint_name
//       where c.table_schema = ${dbName} and c.table_name = ${tbName}
//       group by c.column_name, c.data_type, c.is_nullable
//       ORDER BY c.ordinal_position`;
//     return { tableMeta: res };
//   } catch (err) {
//     console.error('getTbSchema error:', err);
//     throw err;
//   }
// }

// /**
//  * Checks if a table exists.
//  * @param params Table parameters.
//  * @returns True if table exists.
//  */
// export async function checkTb({ dbName, tbName }: { dbName: string; tbName: string }): Promise<boolean> {
//   try {
//     console.log("dbname from checktb: " + dbName);
//     const { tableData } = await getTables(dbName);
//     return tableData.some((a) => a.tbName === tbName);
//   } catch (err) {
//     console.error('checkTb error:', err);
//     throw err;
//   }
// }

// /**
//  * Creates a table in a database.
//  * @param params Table parameters.
//  * @returns True if successful.
//  */
// export async function createTb({
//   dbName,
//   tbName,
//   columns,
//   desc,
//   userId,
//   isPrivate,
//   viewers,
//   editors,
// }: {
//   dbName: string;
//   tbName: string;
//   columns: ColumnDef[];
//   desc?: string;
//   userId: string;
//   isPrivate?: boolean;
//   viewers?: string;
//   editors?: string;
// }): Promise<boolean> {
//   try {
//     if (!(await checkDb(dbName))) throw { customMessage: `Unauthorized action` };
//     if (await checkTb({ dbName, tbName })) throw { customMessage: "Table already exists." };
//     if (!columns.length) throw { customMessage: "Empty columns" };

//     const nameCheck = /^[A-Z0-9_£$%&!#]*$/i;
//     if (!nameCheck.test(tbName)) throw { message: "Not a valid table name" };

//     let colArr: any[] = [];
//     let primaryFound = false;

//     for (const col of columns) {
//       const name = nameCheck.test(col.name) ? col.name : `Random_name${Math.floor(Math.random() * 1000)}`;
//       const type =
//         col.type === "number"
//           ? col.ai
//             ? `integer`
//             : `real`
//           : col.type === "boolean"
//             ? `boolean`
//             : col.type === "file"
//               ? `bytea`
//               : col.type === "date"
//                 ? `timestamp`
//                 : `text`;
//       const def =
//         col.defaultNum && (type === "number" || type === "boolean")
//           ? Number(col.defaultNum)
//           : col.defaultStr && type === "text" && filterInput(col.defaultStr);
//       const unique = col.unique ? "unique" : null;
//       const primary = !primaryFound && col.primary ? "primary key" : null;
//       !primaryFound && col.primary && (primaryFound = true);
//       const notnull = col.notnull ? "not null" : null;

//       if (col.name && col.type) {
//         let colData = mainDb`${mainDb(name)} ${mainDb.raw(type)}`;
//         unique && (colData = mainDb`${colData} unique`);
//         primary && (colData = mainDb`${colData} primary key`);
//         notnull && (colData = mainDb`${colData} not null`);
//         def && (colData = mainDb`${colData} default ${def}`);
//         colArr.push(colData);
//       }
//     }

//     // Combine column definitions (e.g., "id" integer primary key, "name" text not null)
//     const cols = mainDb`${mainDb.array(colArr)}`;
//     await mainDb`create table ${mainDb([dbName, tbName])} (${cols}, updated_at timestamp, updated_by text)`; // Fixed: datetime → timestamp

//     const metaAdded = await addMetadata({ userId, isPrivate, dbName, tbName, desc, viewers, editors });
//     if (!metaAdded) {
//       console.log(`metaData not added for database: ${dbName}, table: ${tbName}`);
//       throw { customMessage: "An error occurred." };
//     }

//     return true;
//   } catch (err) {
//     console.error('createTb error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves table data.
//  * @param params Data parameters.
//  * @returns Table rows.
//  */
// export async function getTbData({
//   dbName,
//   tbName,
//   orderBy,
//   userId,
//   where,
// }: {
//   dbName: string;
//   tbName: string;
//   orderBy?: { col: string; order: "asc" | "desc" };
//   userId: string;
//   where?: { col: string; val: string };
// }): Promise<{ rows: any[] }> {
//   try {
//     if (!(await checkTb({ dbName, tbName }))) throw { customMessage: "Database or table not found!" };

//     const orderCol = filterInput(orderBy?.col);
//     const order = orderBy?.order.toLowerCase() === "desc" ? "desc" : "asc";
//     const whereCol = filterInput(where?.col);
//     const whereVal = filterInput(where?.val);

//     const res = await mainDb`
//       Select * from ${mainDb([dbName, tbName])}
//       ${orderCol ? mainDb`order by ${mainDb(orderCol)} ${mainDb.raw(order)}` : mainDb.raw("")}
//       ${whereCol ? mainDb`where ${mainDb(whereCol)} = ${whereVal}` : mainDb.raw("")}`;
//     console.log("TB data from getTBData: ", JSON.stringify(res));
//     if (!res.length) console.log({ customMessage: "No table data exists" });
//     return { rows: res };
//   } catch (err) {
//     console.error('getTbData error:', err);
//     throw err;
//   }
// }

// /**
//  * Inserts data into a table.
//  * @param params Data parameters.
//  * @returns True if successful.
//  */
// export async function insertData({
//   dbName,
//   tbName,
//   colVals,
//   userId,
// }: {
//   dbName: string;
//   tbName: string;
//   colVals: { [key: string]: any }[];
//   userId: string;
// }): Promise<boolean> {
//   try {
//     if (!(await checkTb({ tbName, dbName }))) throw { customMessage: "Database or table not found" };
//     if (!(await checkUser({ userId })).userId) throw { customMessage: "Unauthorized" };

//     console.log("in insertData, db, tb and userId found");
//     if (!colVals.length || typeof colVals[0] !== "object") {
//       throw { customMessage: "Problem parsing the columns; Try reloading the page", message: "ColVals in wrong format" };
//     }

//     const { tableMeta } = await getTbSchema({ dbName, tbName });
//     const now = new Date();
//     let updatedAtFound = false;
//     let updatedByFound = false;
//     for (const a of tableMeta) {
//       if (a.colName.toLowerCase() === "updated_at") updatedAtFound = true;
//       if (a.colName.toLowerCase() === "updated_by") updatedByFound = true;
//       if (updatedAtFound && updatedByFound) break;
//     }

//     if (!updatedAtFound || !updatedByFound) {
//       await mainDb`
//         alter table ${mainDb([dbName, tbName])}
//         ${!updatedAtFound ? mainDb.raw("add column updated_at timestamp") : mainDb.raw("")}
//         ${!updatedByFound ? mainDb.raw(`${!updatedAtFound ? "," : ""} add column updated_by text`) : mainDb.raw("")}`;
//     }

//     let colArr: any[] = [];
//     let valuesArr: any[] = [];

//     for (const [i, cols] of colVals.entries()) {
//       if (i === 0) {
//         for (const a of Object.keys(cols)) {
//           if (a) colArr.push(mainDb`${mainDb(a)}`);
//         }
//       }

//       const values: any[] = [];
//       for (const val of Object.values(cols)) {
//         if (val) values.push(mainDb`${val}`);
//       }
//       valuesArr.push(mainDb`(${mainDb.array(values)}, ${now}, ${userId})`);
//     }

//     const colnames = colArr.reduce((agg, col, i) => (i === 0 ? col : mainDb`${agg},${col}`), mainDb``);
//     const res = await mainDb`insert into ${mainDb([dbName, tbName])} (${colnames}, updated_at, updated_by) values ${mainDb.array(valuesArr)}`;

//     if (!res.count) throw { customMessage: "insert failed" };
//     const metaAdded = await addMetadata({ dbName, tbName, updatedBy: userId });
//     if (!metaAdded) console.log("insertData meta not added");

//     return true;
//   } catch (err) {
//     console.error('insertData error:', err);
//     throw err;
//   }
// }

// /**
//  * Alters a table (placeholder).
//  * @param params Alter parameters.
//  */
// export async function alterTable({ key, dbName, tbName }: { key: string; dbName: string; tbName: string }): Promise<void> {
//   // TODO: Implement add/delete/rename column, change type
//   console.log('alterTable not implemented:', { key, dbName, tbName });
// }

// /**
//  * Renames a table.
//  * @param params Rename parameters.
//  */
// export async function renameTable({
//   dbName,
//   tbName,
//   userId,
//   newTbName,
// }: {
//   dbName: string;
//   tbName: string;
//   userId: string;
//   newTbName: string;
// }): Promise<void> {
//   try {
//     if (!(await checkTb({ dbName, tbName }))) throw { customMessage: "Unauthorized!" };
//     await authDb`alter table ${authDb([dbName, tbName])} rename to ${newTbName}`;
//   } catch (err) {
//     console.error('renameTable error:', err);
//     throw err;
//   }
// }

// /**
//  * Renames a schema.
//  * @param params Rename parameters.
//  */
// export async function renameSchema({
//   dbName,
//   userId,
//   newDbName,
// }: {
//   dbName: string;
//   userId: string;
//   newDbName: string;
// }): Promise<void> {
//   try {
//     if (!(await checkDb(dbName))) throw { customMessage: "Unauthorized!" };
//     await authDb`alter schema ${authDb(dbName)} rename to ${newDbName}`; // Fixed: alter table → alter schema
//   } catch (err) {
//     console.error('renameSchema error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves all users with metadata.
//  * @returns Array of users or null.
//  */
// export async function getAllUsers(): Promise<(User & { currU: { created: { db: string[]; tb: string[] }; views: { db: string[]; tb: string[] }; edits: { db: string[]; tb: string[] } } })[] | null> {
//   try {
//     const allUsers = await authDb`select id, title, firstname, lastname, username, level from user`;
//     if (!allUsers.length) {
//       console.log("allUsers HAS NO rows");
//       return null;
//     }

//     const users: (User & { currU: { created: { db: string[]; tb: string[] }; views: { db: string[]; tb: string[] }; edits: { db: string[]; tb: string[] } } })[] = [];
//     const meta = await authDb`select db_name as db, tb_name as tb, created_by as cby, viewers, editors from metadata`;

//     allUsers.forEach((u) => {
//       const currU = {
//         created: { db: [], tb: [] },
//         views: { db: [], tb: [] },
//         edits: { db: [], tb: [] },
//       };

//       for (const md of meta) {
//         if (md.editors.includes(u.id)) {
//           md.tb ? currU.edits.tb.push(`${md.db}/${md.tb}`) : currU.edits.db.push(md.db);
//         } else if (md.viewers.includes(u.id)) {
//           md.tb ? currU.views.tb.push(`${md.db}/${md.tb}`) : currU.views.db.push(md.db);
//         }
//         if (md.cby.includes(u.id)) {
//           md.tb ? currU.created.tb.push(`${md.db}/${md.tb}`) : currU.created.db.push(md.db);
//         }
//       }
//       users.push({ ...u, currU });
//     });

//     return users;
//   } catch (err) {
//     console.error('getAllUsers error:', err);
//     throw err;
//   }
// }

// /**
//  * Creates a user session.
//  * @param params Session parameters.
//  * @returns Session expiration and token.
//  */
// export async function createSession({
//   userId,
//   dcrPass,
//   token32,
// }: {
//   userId: string;
//   dcrPass: string;
//   token32: string;
// }): Promise<{ expiresAt: Date | null; token32?: string }> {
//   try {
//     const uid = (await checkUser({ userId, password: dcrPass })).userId;
//     console.log("uid (userId frm createSession): " + uid + " \n token32: " + token32);
//     if (!uid || !token32) return { expiresAt: null };

//     const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token32)));
//     const expAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
//     await delSession({ userId });
//     const rowIn = await authDb`insert into user_session (id, user_id, expires_at) values (${sessionId}, ${userId}, ${expAt})`;

//     if (!rowIn.count) {
//       throw { customMessage: "User session couldn’t be created. You’ll have to log in again!" };
//     }
//     return { expiresAt: expAt, token32 };
//   } catch (err) {
//     console.error('createSession error:', err);
//     throw err;
//   }
// }

// /**
//  * Deletes a user session.
//  * @param params Session parameters.
//  * @returns True if successful.
//  */
// export async function delSession({ userId }: { userId: string }): Promise<boolean> {
//   try {
//     const rowDel = await authDb`delete from user_session where user_id = ${userId}`;
//     return !!rowDel.count;
//   } catch (err) {
//     console.error('delSession error:', err);
//     throw err;
//   }
// }

// /**
//  * Updates a user session.
//  * @param params Session parameters.
//  * @returns True if successful.
//  */
// export async function updateSession({
//   sessionId,
//   expires_at,
// }: {
//   sessionId: string;
//   expires_at: Date;
// }): Promise<boolean> {
//   try {
//     const rowUpd = await authDb`update user_session set expires_at = ${expires_at} where id = ${sessionId}`;
//     console.log("rowUpd from updsession: " + rowUpd);
//     return !!rowUpd.count;
//   } catch (err) {
//     console.error('updateSession error:', err);
//     throw err;
//   }
// }

// /**
//  * Retrieves a user session.
//  * @param params Session parameters.
//  * @returns User data.
//  */
// export async function getSession({
//   token32,
//   update,
//   getId,
// }: {
//   token32: string;
//   update?: boolean;
//   getId?: boolean;
// }): Promise<User & { expiresAt?: Date }> {
//   try {
//     const sessionId = token32 ? encodeHexLowerCase(sha256(new TextEncoder().encode(token32))) : null;
//     const rowArr = authDb`
//       select
//         user_session.expires_at as expiresAt,
//         user.username,
//         user.firstname,
//         user.lastname,
//         user.title,
//         user.joined,
//         user.level,
//         user.id as userId,
//         user.avatar_url as avatarUrl
//       from user_session
//       INNER JOIN user on user_session.user_id = user.id
//       where user_session.id = ${sessionId}`;
//     const row = await authDb`${rowArr}`;

//     if (!row.length) throw { customMessage: "Session does not exist." };

//     const rowTime = row[0].expiresAt.getTime();
//     console.log("GetSession Session exists. RowTime.getTime(): ", rowTime);
//     console.log("GetSession Session exists. row[0].expires_at: ", row[0].expiresAt);

//     if (!rowTime || Date.now() >= rowTime) {
//       await delSession({ userId: row[0].userId });
//       throw { message: "Session expired!" };
//     }

//     let sessionUpdated = false;
//     if (update && Date.now() >= rowTime - 1000 * 60 * 60 * 24 * 3) {
//       const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
//       if (await updateSession({ sessionId, expires_at })) sessionUpdated = true;
//     }

//     const { userId, expiresAt, ...user1 } = row[0];
//     let user: User & { expiresAt?: Date } = user1;
//     if (getId) user = { userId, ...user1 };
//     if (update && sessionUpdated) user = { expiresAt, ...user1 };

//     return user;
//   } catch (err) {
//     console.error('getSession error:', err);
//     throw err;
//   }
// }

// /**
//  * Checks if a user exists.
//  * @param params User parameters.
//  * @returns User data or null.
//  */
// export async function checkUser({
//   userId,
//   email,
//   username,
//   password,
// }: {
//   userId?: string;
//   email?: string;
//   username?: string;
//   password?: string;
// }): Promise<User | { userId: null }> {
//   try {
//     if (!userId && !email && !username) return { userId: null };
//     const col = userId ? `id` : email ? `email` : `username`;
//     const row = await authDb`
//       select * from user
//       where ${authDb(col)} = ${userId || email || username}`;

//     if (row.length && password) {
//       const samePass = await bcrypt.compare(password.trim(), row[0].password);
//       if (samePass) {
//         return {
//           pass: row[0].password,
//           email: row[0].show_email && row[0].email,
//           username: row[0].username,
//           firstname: row[0].firstname,
//           title: row[0].title,
//           userId: row[0].id,
//           joined: row[0].joined,
//           level: row[0].level,
//           avatarUrl: row[0].avatar_url,
//           bio: row[0].bio,
//         };
//       }
//     } else if (row.length) {
//       return {
//         email: row[0].show_email && row[0].email,
//         username: row[0].username,
//         firstname: row[0].firstname,
//         level: row[0].level,
//         avatarUrl: row[0].avatar_url,
//         joined: row[0].joined,
//         title: row[0].title,
//         bio: row[0].bio,
//         userId: row[0].id,
//       };
//     }
//     return { userId: null };
//   } catch (err) {
//     console.error('checkUser error:', err);
//     throw err;
//   }
// }

// /**
//  * Generates a new unique username.
//  * @param params Username parameters.
//  * @returns New username or null.
//  */
// async function newUsername({ username }: { username: string }): Promise<{ newUsername: string | null }> {
//   try {
//     let newUsername: string | null = null;
//     function randFn() {
//       return Math.floor(Math.random() * 10);
//     }
//     for (let i = 0; i < 100; i++) {
//       const randNum = [randFn(), randFn(), randFn()];
//       const newUname = username + randNum.join("");
//       const { userId } = await checkUser({ username: newUname });
//       if (!userId) {
//         newUsername = newUname;
//         break;
//       }
//     }
//     return { newUsername };
//   } catch (err) {
//     console.error('newUsername error:', err);
//     throw err;
//   }
// }

// /**
//  * Checks or generates a username.
//  * @param params Username parameters.
//  * @returns Username data.
//  */
// export async function checkUsername({
//   username,
//   userId,
// }: {
//   username?: string;
//   userId: string;
// }): Promise<{ newUsername: string | null; username: string }> {
//   try {
//     const u = await checkUser({ userId });
//     if (!u.userId) throw { customMessage: "Unauthorized" };

//     const uName = username || u.firstname || "";
//     const { newUsername } = await newUsername({ username: uName });

//     return { newUsername, username: u.username || "" };
//   } catch (err) {
//     console.error('checkUsername error:', err);
//     throw err;
//   }
// }

// /**
//  * Creates a new user.
//  * @param params User parameters.
//  * @returns Session expiration.
//  */
// export async function createUser({
//   firstname,
//   lastname,
//   email,
//   pass,
//   token32,
//   title,
//   gender,
// }: {
//   firstname: string;
//   lastname: string;
//   email: string;
//   pass: string;
//   token32: string;
//   title: number;
//   gender: number;
// }): Promise<{ expiresAt: Date }> {
//   try {
//     if (!firstname || !lastname || !email || !pass || !token32 || !title) {
//       throw { customMessage: "Incomplete user credentials" };
//     }
//     const id = (await checkUser({ email })).userId;
//     if (id) throw { customMessage: "Account exists; Login Instead!" };

//     const userId = uuidv4();
//     const hashedPass = await bcrypt.hash(pass, 11);
//     const title1 = title === 1 ? "Mr." : title === 2 ? "Ms." : title === 3 ? "Mrs." : title === 4 ? "Dr." : "Prof.";
//     const gender1 = gender === 1 ? "M" : "F";
//     const vals = [firstname, lastname, email.toLowerCase(), hashedPass, userId, title1, gender1];

//     console.log("createUser just before insert executed ");
//     const rowIn = await authDb`
//       insert into user (firstname, lastname, email, password, id, title, gender)
//       values (${authDb.array(vals)})`;
//     console.log("createUser insert executed ", rowIn);

//     if (!rowIn.count) throw { message: "Some error occurred." };

//     const { expiresAt } = await createSession({ userId, dcrPass: pass, token32 });
//     if (!expiresAt?.getTime()) {
//       throw { customMessage: "Failed to create a session; Registration was successful" };
//     }

//     return { expiresAt };
//   } catch (err) {
//     console.error('createUser error:', err);
//     throw err;
//   }
// }
