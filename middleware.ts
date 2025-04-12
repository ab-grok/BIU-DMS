// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest): Promise<NextResponse> {
//   if (req.method == "GET") {
//     const res = NextResponse.next();
//     const token = req.cookies.get("session")?.value ?? null;
//     if (token != null) {
//       res.cookies.set("session", token, {
//         path: "/",
//         maxAge: 60 * 60 * 24 * 30,
//         sameSite: "lax",
//         httpOnly: true,
//       });
//     } else {
//       redirect("/login");
//     }
//     return NextResponse.next();
//   }
//   const origin_header = req.headers.get("Origin");
//   const host_header = req.headers.get("Host");
//   if (origin_header == null || host_header == null)
//     return new NextResponse(null, { status: 403 });
//   let origin: URL;
//   try {
//     origin = new URL(origin_header);
//   } catch (e) {
//     return new NextResponse(null, { status: 403 });
//   }
//   if (origin.host !== host_header)
//     return new NextResponse(null, { status: 403 });
//   return NextResponse.next();
// }
