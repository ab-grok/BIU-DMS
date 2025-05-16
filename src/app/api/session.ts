import { validateSession } from "@/lib/sessions";
import { NextApiRequest, NextApiResponse } from "next";

export default async function session(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method == "GET") {
    const { session } = req.cookies;
    try {
      const sess = await validateSession(session);
      if (sess) {
        res.status(200).send(sess);
      }
      res.redirect("/login");
      return;
    } catch (e) {
      console.log("Problem with session: ", e);
    }
  }
  //validate session here
}
