import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth-server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "SESSION_TERMINATED: Admin logged out successfully.",
  });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
