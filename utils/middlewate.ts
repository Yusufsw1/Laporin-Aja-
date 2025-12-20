// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("authToken")?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

//     // Protect admin route
//     if (req.nextUrl.pathname.startsWith("/admin") && decoded.role !== "admin") {
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }

//     return NextResponse.next();
//   } catch {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }
// }

// export const config = {
//   matcher: ["/dashboard/:path*", "/admin/:path*"],
// };
