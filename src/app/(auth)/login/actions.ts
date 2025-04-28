"use server";

import { loginSchema, loginType } from "@/lib/authschema";
import bcrypt from "bcryptjs";
import {
  createSessionCookie,
  encryptText,
  generateSessionToken,
} from "@/lib/sessions";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function logUser(logIn: loginType): Promise<{ error: string }> {
  try {
    const token32 = await generateSessionToken();
    const { username, password } = loginSchema.parse(logIn);
    const email = username.includes("@") ? username : "";
    const encPass = await encryptText(password);
    const res = await fetch(`${process.env.SERVER}/user/validate`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        x_user_email: email,
        x_user_name: !email ? username : "",
        x_pass: encPass ?? "",
        x_token: (await encryptText(token32)) ?? "",
      },
    });

    if (!res.ok)
      return {
        error: `Incorrect ${email ? "email" : "username"} or password!`,
      };
    const { expiresAt } = await res.json();
    console.log("this is expiresAt: " + expiresAt);
    console.log("this is token32: " + token32);
    if (!expiresAt) return { error: `Something went wrong.` };
    const cookieSet = await createSessionCookie({ token32, expiresAt });
    if (!cookieSet)
      return { error: "Couldn't set cookies, You may be signed out." };
    redirect("/?signed_in");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { error: "There's a problem with the server; Hang on tight." };
  }
}
