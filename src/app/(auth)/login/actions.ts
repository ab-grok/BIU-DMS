"use server";

import { loginSchema, loginType } from "@/lib/authschema";
import bcrypt from "bcryptjs";
import { createSession, createSessionCookie } from "../../../lib/sessions";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function logUser(logIn: loginType): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(logIn);
    const name = username.includes("@") ? "email" : "username";
    const res = await fetch("/user/check", {
      method: "GET",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ [name]: username }),
    });

    const { id, pass } = await res.json();
    if (!id) return { error: `Incorrect ${name} or password!` };
    const samePass = await bcrypt.compare(password, pass);
    if (!samePass) return { error: `Incorrect ${name} or password!` };

    const { sessionCreated, token32 } = await createSession({ userid: id });
    if (!sessionCreated)
      return { error: "Could not create session; User exists." };
    const cookieSet = await createSessionCookie({ token32 });
    if (!cookieSet) return { error: "Could not set cookies; Session created." };

    redirect("/");
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { error: "Something went wrong; Try again." };
  }
}
