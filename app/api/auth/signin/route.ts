// app/api/auth/signin/route.ts

import { serverSignIn } from "@/lib/service/hooks/userService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cookie = req.headers.get("cookie") ?? undefined;

    const { status, data, setCookie } = await serverSignIn(body, cookie);

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
    console.error("signin route error:", err);
    return NextResponse.json(
      { message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
