import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth-server";

export async function GET(request: Request) {
  const isAuth = isAuthenticatedRequest(request);
  return NextResponse.json({ authenticated: isAuth });
}
