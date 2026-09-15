import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EDITOR"];
const PUBLIC_ACCOUNT_ROUTES = [
  "/account/login",
  "/account/register",
  "/account/forgot-password",
  "/account/reset-password",
];

function applySecurityHeaders(res: NextResponse) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return res;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || !ADMIN_ROLES.includes(req.auth!.user.role)) {
      return NextResponse.redirect(new URL("/account/login?callbackUrl=/admin", req.nextUrl.origin));
    }
  } else if (pathname.startsWith("/account") && !PUBLIC_ACCOUNT_ROUTES.includes(pathname)) {
    if (!isLoggedIn) {
      const signInUrl = new URL("/account/login", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|css|js)$).*)",
  ],
};
