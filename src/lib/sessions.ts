"use server";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import cookie from "cookie";
import { revalidateTag, unstable_cache } from "next/cache";
import { createCipheriv, randomBytes } from "crypto";
import { cookies } from "next/headers";

// type session = {
//   token: string;
//   expiresAt: Date;
// };
type sessionValidation = {
  email: string | undefined;
  username: string;
  firstname: string;
  level: string;
  avatarUrl: string | undefined;
  joined: string;
  title: string;
  bio: string;
  userId: string;
} | null;

export async function generateSessionToken(): Promise<string> {
  //upon logging or signing up
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function getCookie(c?: any) {
  if (c) {
    console.log("cookie from getCookie fn: " + JSON.stringify(c));
    const token32 = cookie.parse(c);
    return token32;
  } else {
    const token32 = (await cookies()).get("session")?.value;
    return { token32 }; //token32 = {value: token}
  }
}

export async function createSessionCookie({
  token32,
  expiresAt,
}: {
  token32: string;
  expiresAt: string;
}): Promise<boolean> {
  try {
    const expires = new Date(expiresAt);
    (await cookies()).set("session", token32, {
      httpOnly: true,
      expires,
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

//delete with revalidateTag(tag) on logout
export async function validateSession(token32: string | undefined) {
  if (!token32) return null;
  const validateWithCookies = unstable_cache(
    async (): Promise<sessionValidation> => {
      console.log("+++++++++++++gets inside unstable_cache's function");
      const res = await fetch(`${process.env.SERVER}/session`, {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "enc-token": (await encryptText(token32)) ?? "",
        },
      });
      console.log("res.status: " + res.status);
      if (!res.ok) return null;
      const user = await res.json();

      console.log(`Got from sessionValidate: ${user}`);

      return {
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        level: user.lvl,
        avatarUrl: user.avatarUrl,
        joined: user.joined,
        title: user.title,
        bio: user.bio,
        userId: user.userId,
      };
    },
    [token32],
    {
      tags: [token32, "session"],
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
  const res = await fetch(`${process.env.SERVER}/session`, {
    method: "DELETE",
    headers: {
      enc_token: (await encryptText(token32)) ?? "",
    },
  });
  if (!res.ok) return { error: "Could not connect to server." };
  const deleted = await res.json();
  if (!deleted) return { error: "The server gave an error." };
  revalidateTag(token32);
  await deleteSessionCookie();
  return { error: "" };
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

export async function useRevalidate(name: string) {
  const { token32 } = await getCookie();
  revalidateTag(`${name}-${token32}`);
  return true;
}
