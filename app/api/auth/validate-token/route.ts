// app/api/auth/validate-token/route.ts
import { serverValidateToken } from "@/lib/service/hooks/userService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") ?? undefined;

    const { status, data, setCookie } = await serverValidateToken(cookie);

    const headers = new Headers();
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        for (const c of setCookie) headers.append("Set-Cookie", c);
      } else {
        headers.set("Set-Cookie", setCookie as string);
      }
    }

    return NextResponse.json(data, { status, headers });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("validate-token route error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
