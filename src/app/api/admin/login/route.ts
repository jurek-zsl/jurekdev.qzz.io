import { NextResponse } from "next/server";
import {
  verifyAdminPassword,
  createSessionToken,
  checkRateLimit,
  COOKIE_NAME,
  COOKIE_OPTIONS,
} from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED: Too many failed login attempts. Please wait 60 seconds." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const candidate = body?.password;

    if (!candidate || typeof candidate !== "string") {
      return NextResponse.json(
        { error: "PASSKEY_REQUIRED: Password field cannot be empty." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(candidate);
    if (!isValid) {
      return NextResponse.json(
        { error: "ACCESS_DENIED: Invalid administrative passkey." },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken();
    const response = NextResponse.json({
      ok: true,
      message: "ROOT_ACCESS_GRANTED: Administrative session verified.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      ...COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication error" },
      { status: 500 }
    );
  }
}
