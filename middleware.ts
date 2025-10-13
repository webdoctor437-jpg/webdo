// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// middleware.ts
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"], // ✅ /api/* 요청은 미들웨어 제외
  runtime: "nodejs", // ✅ Node 런타임 강제
};


export function middleware(req: NextRequest) {
  const headers: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Content-Security-Policy": [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com https://*.your-api.com",
      "frame-ancestors 'none'",
    ].join("; "),
  };

  const res = NextResponse.next();
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}
