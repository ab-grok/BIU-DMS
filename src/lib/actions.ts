"use server";

import { encryptText, getCookie } from "@/lib/sessions";
import { revalidateTag, unstable_cache } from "next/cache";
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

export async function listDatabases(
  token32: string | undefined,
): Promise<Array<db> | null> {
  if (!token32) return null;
  const dbList = unstable_cache(
    async () => {
      const res = await fetch(`${process.env.SERVER}/databases`, {
        method: "GET",
        headers: {
          enc_token: (await encryptText(token32)) ?? "",
        },
      });

      if (res.ok) {
        const items = await res.json();
        console.log(items);
        return items;
      }
      return null;
    },
    [`databases-${token32}`],
    { tags: [`databases-${token32}`, token32], revalidate: 3600 },
  );
  const data = await dbList();
  return data;
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
  topAdmin: string;
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
export async function ListTables(
  db_name: string,
  token32: string | null,
): Promise<Array<Tb> | null> {
  if (!token32) return null;
  const Tables = unstable_cache(
    async () => {
      console.log("~~~~~~~~~~~~~~");
      console.log("dbName: ", db_name);
      const res = await fetch(`${process.env.SERVER}/tables`, {
        method: "GET",
        headers: {
          enc_token: (await encryptText(token32)) ?? "",
          db_name,
        },
      });
      console.log("res status", res.status);
      if (!res.ok) return null;

      const tables = await res.json();
      return tables;
    },
    [`tables-${token32}`],
    { tags: [`tables-${token32}`, token32] },
  );
  const tbs = await Tables();
  return tbs;
}

async function getUser() {
  const token32 = getCookie();
  const userData = unstable_cache(
    async () => {
      const res = await fetch(`${process.env.SERVER}/database/users`);
    },
    [`userdata-${token32}`],
    {
      tags: [`userdata-${token32}`, `userdata`],
      revalidate: 3600,
    },
  );
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
