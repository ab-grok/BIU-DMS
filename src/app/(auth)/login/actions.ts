"use server";

import { loginSchema, loginType } from "@/lib/authschema";
import { createSessionCookie, generateSessionToken } from "@/lib/sessions";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { checkUser, createSession } from "@/lib/server";

export async function logUser(logIn: loginType): Promise<{ error: string }> {
  console.log("------user logged");
  try {
    const token32 = await generateSessionToken();
    const { username, password } = loginSchema.parse(logIn);
    let email = "";
    let uName = "";
    username.includes("@") ? (email = username) : (uName = username);

    const { userId } = await checkUser({
      username: uName,
      email,
      password,
      userId: "",
    });

    if (!userId) throw { customMessage: "User not found" };
    const { expiresAt } = await createSession({
      userId,
      dcrPass: password,
      token32,
    });
    if (!expiresAt) throw { customMessage: "Something went wrong!" };

    console.log("this is expiresAt: " + expiresAt);
    console.log("this is token32: " + token32);

    const cookieSet = await createSessionCookie({ token32, expiresAt });
    if (!cookieSet)
      return { error: "Cookies weren't set, You may be signed out." };
    redirect("/?signed_in");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { error: "There's a problem with the server; Hang on tight." };
  }
}
