"use server";

import { signupSchema, signupType } from "@/lib/authschema";
import { createUser } from "@/lib/server";
import { createSessionCookie, generateSessionToken } from "@/lib/sessions";

export async function signUser(
  signUp: signupType,
): Promise<{ signError: boolean; errMessage: string }> {
  try {
    const { firstname, lastname, email, password, gender, title } =
      signupSchema.parse(signUp);
    //create new user
    const token32 = await generateSessionToken();
    const { expiresAt } = await createUser({
      firstname,
      lastname,
      email,
      pass: password,
      token32,
      title,
      gender,
    });

    console.log("---------signup entered. got expiresAt ", expiresAt);
    if (!expiresAt)
      return {
        signError: true,
        errMessage: "An error occured; Try again later",
      };

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
    // if (isRedirectError(e)) throw e;
    console.log(e);
    return { signError: true, errMessage: "Something went wrong!" };
  }
}

// type userCreated = {
//   emailExists: string | null;
//   userId: number | null;
// };
