// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // export const config = {
// //   matcher: [
// //     "/((?!_next/static|_next/image|favicon.ico|api/|analyze).*)",
// //   ],
// //   runtime: "nodejs",
// // };

// // export function middleware(req: NextRequest) {
// //   const res = NextResponse.next();

// //   // 최소 보안 헤더만 남기기 (문제 원인 좁히기)
// //   res.headers.set("X-Frame-Options", "DENY");
// //   res.headers.set("X-Content-Type-Options", "nosniff");
// //   res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

// //   // 🔥 Content-Security-Policy는 일단 주석 처리
// //   // res.headers.set("Content-Security-Policy", "...");

// //   return res;
// // }
