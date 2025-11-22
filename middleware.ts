// /middleware.ts
import { NextRequest, NextResponse } from "next/server";

/**
 * Rotas que queremos proteger (lista estática).
 * Atualize manualmente se precisar proteger outras rotas.
 */
const STATIC_SECURE_PATHS = ["/dashboard"];

/**
 * matcher precisa ser literal estático.
 */
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};

const SKIP_PREFIXES = [
  "/_next", // Next.js static chunks
  "/static", // static assets
  //   "/api", // rotas API — se quiser proteger APIs, remova isso
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/images",
  "/assets",
];

function shouldSkipPath(pathname: string) {
  if (
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  )
    return true;
  // ignora prefixes
  return SKIP_PREFIXES.some(
    (p) =>
      pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p)
  );
}

function isPathSecure(pathname: string) {
  return STATIC_SECURE_PATHS.some((sp) =>
    sp === "/"
      ? pathname === "/" || pathname.startsWith("/")
      : pathname === sp || pathname.startsWith(sp + "/")
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) IGNORA assets e rotas listadas rapidamente
  if (shouldSkipPath(pathname)) {
    // não logar para não poluir o console
    return NextResponse.next();
  }

  // 2) Se não for rota segura, segue
  if (!isPathSecure(pathname)) {
    console.log("[middleware] rota não é segura — next()", pathname);
    return NextResponse.next();
  }

  console.log("[middleware] protegendo:", pathname);

  const origin = req.nextUrl.origin;
  const cookie = req.headers.get("cookie") ?? "";

  // valida token no backend
  try {
    const validateResp = await fetch(`${origin}/api/auth/validate-token`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });

    console.log("[middleware] validate-token status=", validateResp.status);

    if (validateResp.status === 200) {
      // token OK -> deixa passar
      return NextResponse.next();
    }
  } catch (err) {
    console.error("[middleware] validate-token fetch error:", err);
    // prossegue para logout/redirect
  }

  // token inválido -> chama logout para limpar session no backend e redireciona para signin
  try {
    const logoutResp = await fetch(`${origin}/api/auth/logout`, {
      method: "POST",
      headers: { cookie },
      cache: "no-store",
    });

    const redirectUrl = new URL("/signin", req.url);
    const res = NextResponse.redirect(redirectUrl);

    // reencaminha Set-Cookie(s) vindos do backend (se houverem)
    try {
      for (const [name, value] of logoutResp.headers) {
        if (name.toLowerCase() === "set-cookie") {
          res.headers.append("Set-Cookie", value);
        }
      }
    } catch (hdrErr) {
      console.warn("[middleware] erro ao repassar set-cookie:", hdrErr);
    }

    // fallback: força limpeza do cookie localmente se backend não enviou Set-Cookie
    if (!logoutResp.headers.get("set-cookie")) {
      res.headers.set(
        "Set-Cookie",
        "accessToken=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
    }

    return res;
  } catch (err) {
    console.error("[middleware] logout error:", err);
    const res = NextResponse.redirect(new URL("/signin", req.url));
    res.headers.set(
      "Set-Cookie",
      "accessToken=; Path=/; HttpOnly; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
    return res;
  }
}
