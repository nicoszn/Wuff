import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/session"];

// Next.js 16 renamed middleware.ts -> proxy.ts (exported function `proxy`,
// Node.js runtime by default instead of Edge). This only checks cookie
// presence; full HMAC signature verification of the session cookie happens
// server-side in lib/session.ts, imported by app/api/session/route.ts.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("weex_session")?.value;

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
