"user server";

import { redirect } from "next/navigation";
import { deleteSession, deleteSessionCookie } from "../../lib/sessions";

export async function logOut(): Promise<{ error: string }> {
  try {
    await deleteSession();
    await deleteSessionCookie();
    redirect("/login");
  } catch (e) {
    console.log(e);
    return { error: "Try logging out again!" };
  }
}
