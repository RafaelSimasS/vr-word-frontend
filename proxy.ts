import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/decks/:path*"],
};

export default async function proxy(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const cookie = req.headers.get("cookie") ?? "";

  try {
    const validateResp = await fetch(`${origin}/api/auth/validate-token`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    console.log("[middleware] validate-token status=", validateResp.status);

    if (validateResp.status === 200) return NextResponse.next();
  } catch (err) {
    console.error("[middleware] validate-token fetch error:", err);
  }

  const redirectUrl = new URL("/signin", req.url);
  const res = NextResponse.redirect(redirectUrl);
  res.headers.set(
    "Set-Cookie",
    "accessToken=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  return res;
}
