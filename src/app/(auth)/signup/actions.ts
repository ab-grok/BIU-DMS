"use server";

import { signupSchema, signupType } from "@/lib/authschema";
import {
  createSessionCookie,
  encryptText,
  generateSessionToken,
} from "@/lib/sessions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signUser(
  signUp: signupType,
): Promise<{ signError: boolean; errMessage: string }> {
  try {
    const { firstname, lastname, email, password, gender, title } =
      signupSchema.parse(signUp);
    //create new user
    const token32 = await generateSessionToken();
    const res = await fetch(`${process.env.SERVER}/user/create`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstname,
        lastname,
        email,
        password: await encryptText(password),
        gender,
        title,
        session: await encryptText(token32),
      }),
    });
    if (!res.ok) {
      const error = await res.json();
      return { signError: true, errMessage: error.customMessage };
    }
    const { expiresAt } = await res?.json();
    console.log(`await res.json().expiresAt: ${expiresAt}`);

    const cookieSet = await createSessionCookie({
      token32,
      expiresAt,
    });
    if (!cookieSet)
      return {
        signError: true,
        errMessage: "Cookies not set; Session created",
      };
    return { signError: false, errMessage: "User created" };
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.log(e);
    return { signError: true, errMessage: "Something went wrong!" };
  }
}

// type userCreated = {
//   emailExists: string | null;
//   userId: number | null;
// };
