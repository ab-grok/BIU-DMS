"use server";

import { unstable_cache } from "next/cache";
import { cache } from "react";

export type db = {
  Database: string;
  tbCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  private: boolean;
  topAdmin: string;
  users: {
    name: string;
    email: string;
    editor: boolean;
  };
};

export async function listDatabases(): Promise<{
  items: Array<db> | null;
}> {
  const dbList = unstable_cache(
    async () => {
      const res = await fetch(`${process.env.SERVER}/databases`);
      if (res.ok) {
        console.log(`theres res: ${res.status}`);
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

export async function timeAgo({ iso }: { iso: string }): Promise<string> {
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

  if (year > 0) return `${year}y ago`;
  else if (month > 0) return `${month}m ago`;
  else if (week > 0) return `${week}w ago`;
  else if (days > 0) return `${days}d ago`;
  else if (hours > 0) return `${hours}h ago`;
  else if (minutes > 0) return `${minutes}min ago`;
  return `${seconds}s ago`;
}
