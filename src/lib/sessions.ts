"use server";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { revalidateTag, unstable_cache } from "next/cache";
import { createCipheriv, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { delSession, getSession } from "./server";

// type session = {
//   token: string;
//   expiresAt: Date;
// };
type sessionValidation = {
  username: string;
  firstname: string;
  level: number;
  avatarUrl: string;
  title: string;
  userId: string;
  joined: string;
  bio: string | null;
  email: string;
  expiresAt: Date;
} | null;

export async function generateSessionToken(): Promise<string> {
  //upon logging or signing up
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function getCookie() {
  const token32 = (await cookies()).get("session")?.value;
  return { token32 }; //token32 = {value: token}
}

export async function createSessionCookie({
  token32,
  expiresAt,
}: {
  token32: string;
  expiresAt: Date;
}): Promise<boolean> {
  try {
    // const expires = new Date(expiresAt);
    (await cookies()).set("session", token32, {
      httpOnly: true,
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV == "production",
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteSessionCookie(): Promise<boolean> {
  const token32 = (await cookies()).get("session");
  if (!token32) {
    console.log("No cookies.");
    return false;
  }
  (await cookies()).set("session", "", {
    maxAge: 0,
    path: "/",
  });
  return true;
}

export async function validateSession() {
  const { token32 } = await getCookie();
  if (!token32) return null;
  console.log("validateSession was hit, token32", token32);

  const validateWithCookies = unstable_cache(
    async (): Promise<sessionValidation> => {
      console.log("+++++++++++++gets inside unstable_cache's function");
      try {
        const user = await getSession({ token32, update: true, getId: true });
        if (!user) throw { customMessage: "User not found!" };
        console.log("got session, user: ", user);
        if (!user) return null;
        // console.log(`Got from sessionValidate: ${JSON.stringify(user)}`);
        //handle expires at from updated session.
        const { expiresAt } = user;
        console.log("got past create session, expiresAt: ", expiresAt);
        if (expiresAt) await createSessionCookie({ token32, expiresAt });
        return user;
      } catch (e: any) {
        console.log(e.customMessage);
        return null;
      }
    },
    [token32],
    {
      tags: ["session-" + token32, "session"],
      revalidate: 3600, //
    },
  );
  const user = await validateWithCookies();
  return user;
}

export async function deleteSession(): Promise<{
  error: string;
}> {
  const token32 = (await cookies()).get("session")?.value;
  if (!token32) return { error: "Session not found!" };
  try {
    console.log("in delete session");
    const user = await validateSession();
    if (!user) return { error: "User not logged in" };
    await delSession({ userId: user.userId });
  } catch (e: any) {
    return { error: e.customMessage };
  }
  revalidateTag("session-" + token32);
  await deleteSessionCookie();
  return { error: "" };
}

export async function useRevalidate(name: string) {
  const { token32 } = await getCookie();
  revalidateTag(`${name}-${token32}`);
  return true;
}

export async function encryptText(text: string) {
  if (!text) return null;
  const key = Buffer.from(process.env.UPKEY as string, "hex");
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}#${encrypted}`;
}
