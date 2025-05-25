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

    if (!userId) return { error: "Incorrect username or password" };
    const { expiresAt } = await createSession({
      userId,
      dcrPass: password,
      token32,
    });
    if (!expiresAt) return { error: "Something went wrong!" };

    console.log("logUser,  expiresAt: " + expiresAt);

    const cookieSet = await createSessionCookie({ token32, expiresAt });
    if (!cookieSet)
      return { error: "Cookies couldn't be set, You may be signed out." };
    redirect("/?signed=success");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { error: "There's a problem with the server; Hang on tight." };
  }
}
