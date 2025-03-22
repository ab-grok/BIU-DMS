"use server";

import { signupSchema, signupType } from "@/lib/authschema";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, createSessionCookie } from "../../../lib/sessions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signUser(
  signUp: signupType,
): Promise<{ signError: boolean; errMessage: string }> {
  try {
    const { firstname, lastname, email, password } = signupSchema.parse(signUp);
    const salt = await bcrypt.genSalt(11);
    const hashedPass = await bcrypt.hash(password, salt);
    //create new user
    const res = await fetch("http://127.0.0.1:8001/user/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPass,
      }),
    });
    const { emailExists, userId }: userCreated = await res?.json();
    console.log(
      `await res.json(): ${JSON.stringify({ emailExists: emailExists, userId: userId })}`,
    );
    if (!userId) {
      if (emailExists) return { signError: true, errMessage: "User exists" };
      else {
        return {
          signError: true,
          errMessage: `Some error occured; but Email can be used.`,
        };
      }
    }

    console.log(`userid: ${userId}`);
    //create new session
    const { sessionCreated, token32 } = await createSession({ userid: userId });
    if (!sessionCreated)
      return {
        signError: true,
        errMessage: "Session not created; User added!",
      };
    const cookieSet = await createSessionCookie({ token32 });
    if (!cookieSet)
      return { signError: true, errMessage: "Cookie not set; Session created" };
    return { signError: false, errMessage: "User created" };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { signError: true, errMessage: "Something went wrong!" };
  }
}

type userCreated = {
  emailExists: string | null;
  userId: number | null;
};
