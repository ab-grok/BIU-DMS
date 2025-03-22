"use server";

import { unstable_cache } from "next/cache";
import { cache } from "react";

export type db = {
  Database: string;
  tbCount: string;
};

export async function ListDatabases(): Promise<{
  items: Array<db> | null;
}> {
  const dbList = unstable_cache(
    async () => {
      const res = await fetch("http://127.0.0.1:8001/databases");
      if (res) {
        const items = await res.json();
        console.log(items);
        return { items: items };
      }
      return { items: null };
    },
    ["databases"],
    { tags: ["databases"], revalidate: 3600 },
  );
  const data = await dbList();
  return data;
}

//revalidate databases on new creation
