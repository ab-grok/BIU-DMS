// move all actions.ts functions to this file.

import { ListTables } from "@/lib/actions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Tables(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { session } = req.cookies;
  if (!session) return res.status(400);

  if (req.method === "GET") {
    const { dbName } = req.query;
    if (!dbName) return res.status(400).json({ error: "Cannot get database." });
    try {
      const ListTb = await ListTables(dbName as string, session);
      res.status(200).send(ListTb);
    } catch (e) {
      console.log("thres an error within api/tables", e);
    }
  }
}
