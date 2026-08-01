import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const APP_HOSTNAME = "studio.forgestackx.com";
const AUTH_GATED_PREFIXES = ["/website-studio", "/poster-generator", "/image-creator", "/dashboard", "/account"];

export async function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const isAppHost =
    host === APP_HOSTNAME || host === "localhost" || host === "127.0.0.1" || host.endsWith(".vercel.app");

  if (!isAppHost) {
    const url = request.nextUrl.clone();
    url.pathname = `/published-domain${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  const pathname = request.nextUrl.pathname;
  const needsAuth = AUTH_GATED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (needsAuth) {
    const session = await auth();
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
