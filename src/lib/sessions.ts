"use server";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { cookies } from "next/headers";
import { revalidateTag, unstable_cache } from "next/cache";

type session = {
  id: string;
  userId: number;
  expiresAt: Date;
};
type sessionValidation =
  | {
      session: session;
      username: string;
    }
  | { session: null; username: null };

export async function generateSessionToken(): Promise<string> {
  //upon logging or signing up
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

//have to create a user first, then use id as userid
export async function createSession({
  userid,
}: {
  userid: number;
}): Promise<{ sessionCreated: Boolean; token32: string }> {
  //converts token to Uint8Array, hashes it, and encodes that in hex
  //need to create session cookie
  const token = await generateSessionToken();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: session = {
    id: sessionId,
    userId: userid,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };
  const res = await fetch("http://127.0.0.1:8001/session/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ session }),
  });

  const { created } = await res.json();
  if (created) return { sessionCreated: created, token32: token };
  return { sessionCreated: false, token32: "" };
}

export async function getCookie() {
  const token32 = (await cookies()).get("session")?.value;
  if (!token32) return { token32: "" };
  return { token32 }; //token32 = {value: token}
}

export async function createSessionCookie({
  token32,
}: {
  token32: string;
}): Promise<boolean> {
  try {
    (await cookies()).set("session", token32, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
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
  if (!token32) console.log("No cookies found.");
  (await cookies()).set("session", "", {
    maxAge: 0,
    path: "/",
  });
  return true;
}

export async function getCookieandValidate() {
  const { token32 } = await getCookie();
  if (!token32) return { session: null, username: null };
  const validateSession = unstable_cache(
    //revalidate with revalidateTag(tag)
    async (): Promise<sessionValidation> => {
      if (!token32) return { session: null, username: null };
      const sessionId = encodeHexLowerCase(
        sha256(new TextEncoder().encode(token32)),
      );
      console.log(`sessionId:${sessionId}`);
      const res = await fetch("http://127.0.0.1:8001/session", {
        method: "GET",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: sessionId }),
      });
      // if (!res.ok) //session exists; not deleted or updated; return something?
      const row = await res.json();
      if (!row && typeof row != "object")
        return { session: null, username: null };
      const session: session = {
        id: row[0],
        userId: row[1],
        expiresAt: row[2],
      };
      const username = row[3];
      console.log(`session and username?: ${{ session, username }}`);
      return { session, username };
    },
    [token32],
    {
      tags: [token32],
      revalidate: 3600, //
    },
  );
  const sessionAndUser = await validateSession();
  return sessionAndUser;
}

// export async function validateSession(): Promise<sessionValidation> {
//   //from getCookie function on page load
//   //token is base32 string from browser , sessionId is its hex
//   type cookie = { name: string; value: string };
//   const token32 = ((await getCookie()).token32 as cookie).value;

//   if (!token32) return { session: null, username: null };
//   const sessionId = encodeHexLowerCase(
//     sha256(new TextEncoder().encode(token32)),
//   );
//   console.log(`sessionId:${sessionId}`);
//   const res = await fetch("http://127.0.0.1:8001/session", {
//     method: "GET",
//     headers: { "content-type": "application/json" },
//     body: JSON.stringify({ id: sessionId }),
//   });
//   // if (!res.ok) //session exists; not deleted or updated; return something?
//   const row = await res.json();
//   if (!row && typeof row != "object") return { session: null, username: null };
//   const session: session = { id: row[0], userId: row[1], expiresAt: row[2] };
//   const username = row[3];
//   console.log(`session and username?: ${{ session, username }}`);
//   return { session, username };
// }

export async function deleteSession(): Promise<{
  error: Boolean;
  message: string;
}> {
  const token32 = (await cookies()).get("session")?.value;
  if (!token32) return { error: true, message: "Session not found!" };
  const sessionId = encodeHexLowerCase(
    sha256(new TextEncoder().encode(token32)),
  );
  const res = await fetch("http://127.0.0.1/8001/session", {
    method: "DELETE",
    body: JSON.stringify({ sessionId }),
  });
  const deleted = await res.json();
  if (!deleted)
    return { error: true, message: "Couldn't delete session; Session found." };
  revalidateTag(token32);
  return { error: false, message: "Session deleted" };
}
