"use server";

import { redirect } from "next/navigation";
import { deleteSession, revalidate } from "@/lib/sessions";

export async function logOut(): Promise<{ error: string }> {
  try {
    const { error } = await deleteSession();
    console.log("user logged out, error: ", error);
    if (!error) redirect("/login");
    console.log("theres error: " + error);
    return { error };
  } catch (e) {
    console.log(e);
    return { error: "Some error occured!" };
  }
}
