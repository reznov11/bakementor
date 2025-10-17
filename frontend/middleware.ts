import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "ru"];

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Ignore Next internals, API routes, and static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0];
  if (first && LOCALES.includes(first)) {
    // set locale cookie so server layout can pick it up
    // but do NOT rewrite — allow Next's router to receive the locale as a route param
    const res = NextResponse.next();
    res.cookies.set("locale", first, { path: "/" });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
