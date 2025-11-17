import axiosClient from "@/lib/service/adapter/axiosClient";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const resp = await axiosClient.post(
      `/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );

    const setCookie = resp.headers["set-cookie"];
    const headers = new Headers();
    if (setCookie) {
      if (Array.isArray(setCookie)) {
        setCookie.forEach((c) => headers.append("Set-Cookie", c));
      } else {
        headers.set("Set-Cookie", setCookie as string);
      }
    }

    return NextResponse.json({ ok: true }, { headers });
  } catch (err) {
    console.error("logout route error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
