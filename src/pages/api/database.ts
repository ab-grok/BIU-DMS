import { listDatabases } from "@/lib/actions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function db(req: NextApiRequest, res: NextApiResponse) {
  //getting all dbs, getting a specific table is handled in tables
  if (req.method === "GET") {
    try {
      const { session } = req.cookies;
      const dbs = await listDatabases(session);
      res.status(200).send(dbs);
    } catch (e) {
      console.log("error with database: ", e);
    }
  }

  if (req.method === "POST") {
    //handle db creation
  }
}
