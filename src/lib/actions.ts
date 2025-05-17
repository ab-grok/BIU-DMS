"use server";

import { createTbCol, createTbMeta } from "@/app/(main)/(pages)/selectcontext";
import { getCookie, validateSession } from "@/lib/sessions";
import { unstable_cache } from "next/cache";
import { getAllUsers, getDb, getSession, getTables } from "./server";
//types
export type db = {
  Database: string;
  tbCount: number;
  createdBy: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  private: boolean;
  topAdmin: string;
  viewers: {
    name: string;
    title: string;
    id: string;
  }[];
  editors: {
    name: string;
    title: string;
    id: string;
  }[];
};

export async function listDatabases(): Promise<Array<db> | null> {
  const { token32 } = await getCookie();
  if (!token32) return null;
  const dbList = unstable_cache(
    async () => {
      console.log("listDatabases token32: " + token32);
      try {
        const { userId } = await getSession({
          token32,
          getId: true,
          update: false,
        });
        if (!userId) throw { message: "Session not found" };
        const { dbWithMeta } = await getDb("getTbcount");
        return dbWithMeta;
      } catch (e) {
        console.log(`Error in listDatabases: ${JSON.stringify(e)}`);
      }
      return null;
    },
    [`databases-${token32}`],
    { tags: [`databases-${token32}`, token32], revalidate: 3600 },
  );
  const data = await dbList();
  return data;
}

export async function createDatabase(): Promise<boolean> {
  //can you get the creatDatabase() working right with sessionId validation and cleared authencation for users with levels not less than 2
  return true;
}

export async function deleteDatabase(): Promise<boolean> {
  //can you get the deleteDatabase() working right with sessionId validation for users with levels not less than 2 and are editors or the creator(which should be an editor)  to
  // const result = await delDb(dbName.toLowerCase());
  // res.status(201).send({ message: `${dbName} deleted!` });
  return true;
}

export type Tb = {
  tbName: string;
  rowCount: number;
  createdBy: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  description: string;
  private: boolean;
  viewers: {
    firstname: string;
    username: string;
    title: string;
    id: string;
  }[];
  editors: {
    firstname: string;
    username: string;
    title: string;
    id: string;
  }[];
};

export async function ListTables(db_name: string): Promise<Array<Tb> | null> {
  const { token32 } = await getCookie();
  if (!token32) return null;
  const Tables = unstable_cache(
    async () => {
      console.log("~~~~~~~~~~in ListTables");
      console.log("dbName: ", db_name);
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
        return tableData;
      } catch (e) {
        console.log(`error in ListTables: ${e}`);
      }
      return null;
    },
    [`tables-${token32}`],
    { tags: [`tables-${token32}`, token32] },
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

export async function getTableSchema() {
  //get cookies and verify if user is a viewer, or editor which includes the creator in order to grant access -- see getUserAccess function in server.js
  //works with getTableSchema from server.js
  // format with return types
}

export async function getTableContent() {
  //getTbData from server.js
  // format with return types
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
      console.log("getUsers unstable_cache ran. token32: ", token32);
      try {
        console.log("token32 from decryptText: ", token32);
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
    [`users-${token32}`],
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

export async function getUserAccess(db?: string, tb?: string): Promise<number> {
  //0 - none, 1 - view, 2 - edit
  const userId = (await validateSession())?.userId;
  const level = (await validateSession())?.level;

  if (!userId) return 0;
  if (tb) {
  } //can add rows
  else if (db) {
    const tbs = await ListTables(db);
    tbs &&
      tbs.forEach((a, i) => {
        const length = Math.max(a.editors.length, a.viewers.length);
        for (let j = 0; j < length; j++) {
          if (a.editors[j]?.id == userId) return 2;
          else if (a.viewers[j]?.id == userId) return 1;
        }
      });
  } else {
    const dbs = await listDatabases();
    dbs &&
      dbs.forEach((a, i) => {
        a.editors.forEach((b, j) => {
          if (b.id == userId) return 2;
        });
      });

    //return 1 if level 2: user can view dbs
  }
  return 0;
}
