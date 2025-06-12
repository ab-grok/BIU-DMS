"use server";

import { createTbCol, createTbMeta } from "@/app/(main)/(pages)/selectcontext";
import { getCookie, validateSession } from "@/lib/sessions";
import { unstable_cache } from "next/cache";
import {
  getAllUsers,
  getDb,
  getSession,
  getTables,
  getTbData,
  getTbSchema,
} from "./server";
//types
export type db = {
  Database: string;
  tbCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  private: boolean;
  viewers: string[];
  editors: string[];
};

export async function listDatabases(): Promise<Array<db> | null> {
  const { token32 } = await getCookie();
  if (!token32) return null;

  const dbList = unstable_cache(
    async () => {
      try {
        const { userId } = await getSession({
          token32,
          getId: true,
          update: false,
        });
        console.log("got session in listDatabases userId: " + userId);
        if (!userId) throw { message: "Session not found" };
        const { rowsMeta } = await getDb("getTbcount");
        return rowsMeta as db[];
      } catch (e) {
        console.log(`Error in listDatabases: ${JSON.stringify(e)}`);
      }

      return null;
    },
    [`databases`],
    { tags: [`databases-${token32}`, "databases"], revalidate: 3600 },
  );
  const data = await dbList();
  return data;
}

// export async function createDatabase(): Promise<boolean> {
//   //can you get the creatDatabase() working right with sessionId validation and cleared authencation for users with levels not less than 2
//   return true;
// }

// export async function deleteDatabase(): Promise<boolean> {
//   const token32 = await getCookie()
//   //can you get the deleteDatabase() working right with sessionId validation for users with levels not less than 2 and are editors or the creator(which should be an editor)  to
//   // const result = await delDb(dbName.toLowerCase());
//   // res.status(201).send({ message: `${dbName} deleted!` });
//   return true;
// }

export type Tb = {
  tbName: string;
  rowCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  description: string;
  private: boolean;
  viewers: string[];
  editors: string[];
};

export type ListTbsType = {
  tbArr: Tb[] | null;
  error: string | null;
};

export async function listTables(db_name: string): Promise<ListTbsType> {
  const { token32 } = await getCookie();
  if (!token32) return { tbArr: null, error: "Unauthorized action" };
  console.log("~~~~~~~~~~in listTables before unstable_cache");
  const Tables = unstable_cache(
    async () => {
      console.log("~~~~~~~~~~in listTables dbName: ", db_name);
      try {
        //expiresAt, username, firstname, lastname, title, joined, level, userId, avatarUrl
        const { userId } = await getSession({
          token32,
          getId: true,
          update: false,
        });
        if (!userId) throw { customMessage: "Couldnt get session" };
        const { tableData } = await getTables(db_name, true);
        // console.log("tableData: ", tableData);
        return { tbArr: tableData as Tb[], error: null };
      } catch (e: any) {
        console.log(`error in listTables: ${JSON.stringify(e)}`);
        return {
          tbArr: null,
          error: e.customMessage || "Couldn't get tables",
        };
      }
    },
    [`tables-${db_name}`],
    { tags: [`tables-${token32}`, token32, "tables"] },
  );
  const tbs = await Tables();
  return tbs;
}

export async function postTable(
  cols: createTbCol,
  meta: createTbMeta,
): Promise<{ error: string }> {
  //
  return { error: "couldn't create table" };
}

export type colSchema = {
  colName: string;
  type: string;
  nullable: boolean;
  keys: string[];
};

export type schemaType = {
  tbSchema: colSchema[] | null;
  error1: string | null;
};

export async function getTableSchema(
  dbName: string,
  tbName: string,
): Promise<schemaType> {
  //get cookies and verify if user is a viewer, or editor which includes the creator in order to grant access -- see getUserAccess function in server.js
  //works with getTableSchema from server.js
  // format with return types
  const { token32 } = await getCookie();
  const getSchemas = unstable_cache(
    async () => {
      try {
        console.log("in getTableSchema, inside unstable_c");
        const { schema } = await getTbSchema({ dbName, tbName, token32 });
        console.log("in getTableSchema, got past getTbSchema");
        const tbSchema = schema as unknown as colSchema[];
        console.log("in getTableSchema got schema from getTbSchema: ", schema);
        return { tbSchema, error1: null };
      } catch (e: any) {
        console.log("error1 in getTableSchema: ", e);
        return {
          tbSchema: null,
          error1: e.customMessage || "Something's not right",
        };
      }
    },
    [`${dbName}-${tbName}-schema`],
    { tags: ["tbSchema", `${dbName}-${tbName}-schema`], revalidate: 86400 },
  );
  const sch = await getSchemas();
  return sch;
}

export type rowData = {
  [column: string]: string | number | null | undefined | Date;
};

type getTableData = {
  tbData?: rowData[];
  error?: any;
};

export async function getTableData(
  dbName: string,
  tbName: string,
  orderBy?: string,
  where?: string,
): Promise<getTableData> {
  const { token32 } = await getCookie();
  console.log("in getTableData, token32: ", token32);
  const tbData = unstable_cache(
    async () => {
      try {
        console.log("inside tbData unstable_c");
        const { rows } = await getTbData({
          dbName,
          tbName,
          orderBy,
          token32,
          where,
        });
        console.log("in getTableData's unstable_c, got past getTbData() ");
        return { tbData: rows as rowData[] };
      } catch (e: any) {
        console.log(" got error in getTableData's unstable_c: ", e);
        return { error: e.customMessage || "Something went wrong!" };
      }
    },
    [`${dbName}-${tbName}-tbData`],
    { tags: ["tbData", `${dbName}-${tbName}-tbData`], revalidate: 86400 },
  );
  return await tbData();
}

export async function setTableContent() {
  //works with insertData
}

export async function alterTable() {
  //things like adding new columns, dropping old ones,
}

//users: {userId, title, firstname, username, level, edits[], views[], created[]},, edits;{db:,tb:}

type views = {
  db: string;
  tb: string;
};
export type allUsers = {
  id: string;
  title: string;
  firstname: string;
  lastname: string;
  username: string;
  level: number;
  edits: views[];
  views: views[];
  created: views[];
};

export async function getUsers(): Promise<Array<allUsers> | null> {
  const { token32 } = await getCookie();
  if (!token32) return null;
  console.log("getUsers ran but not unstable_cache token32: ", token32);

  const userData = unstable_cache(
    async () => {
      try {
        console.log("getUsers unstable_cache ran. token32: ", token32);
        const { userId } = await getSession({
          token32,
          update: false,
          getId: true,
        });
        if (!userId) throw { customMessage: "Unauthorized." };
        const users = await getAllUsers();
        if (!users) throw { customMessage: "users not found" };
        return users;
      } catch (e: any) {
        console.log("error in getUsers: " + e);
        return null;
      }
    },
    [`users`],
    {
      tags: [`users-${token32}`, `users`],
      revalidate: 3600,
    },
  );
  return await userData();
}

export async function timeAgo(iso: string): Promise<string> {
  console.log("timeago executed?");
  const pastTime = new Date(iso);
  const currentTime = new Date();

  const diff = currentTime.getTime() - pastTime.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const week = Math.floor(days / 7);
  const month = Math.floor(days / 30);
  const year = Math.floor(days / 365);

  if (year > 0) return `${year}y`;
  else if (month > 0) return `${month}m`;
  else if (week > 0) return `${week}w`;
  else if (days > 0) return `${days}d`;
  else if (hours > 0) return `${hours}h`;
  else if (minutes > 0) return `${minutes}min`;
  return `${seconds}s`;
}

// async function getUserAccess(db?: string, tb?: string): Promise<number> {
//   //0 - none, 1 - view, 2 - edit
//   const {userId, level} = (await validateSession())?.userId;
//   const level = (await validateSession())?.level;

//   if (!userId) return 0;
//   if (tb) {
//   } //can add rows
//   else if (db) {
//     const tbs = await listTables(db);
//     tbs &&
//       tbs.forEach((a, i) => {
//         const length = Math.max(a.editors.length, a.viewers.length);
//         for (let j = 0; j < length; j++) {
//           if (a.editors[j]?.id == userId) return 2;
//           else if (a.viewers[j]?.id == userId) return 1;
//         }
//       });
//   } else {
//     const dbs = await listDatabases();
//     dbs &&
//       dbs.forEach((a, i) => {
//         a.editors.forEach((b, j) => {
//           if (b.id == userId) return 2;
//         });
//       });

//     //return 1 if level 2: user can view dbs
//   }
//   return 0;
// }
