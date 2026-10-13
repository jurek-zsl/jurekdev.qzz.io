import { NextResponse } from "next/server";
import {
  isAuthenticatedRequest,
  verifyAdminPassword,
  updateAdminPassword,
  createSessionToken,
  COOKIE_NAME,
  COOKIE_OPTIONS,
} from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Active administrative session required." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    // Verify current password
    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { error: "CURRENT_PASSWORD_INCORRECT: The current password you entered is invalid." },
        { status: 403 }
      );
    }

    // Update password
    const success = updateAdminPassword(newPassword);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update admin password on server." },
        { status: 500 }
      );
    }

    // Issue refreshed session cookie
    const sessionToken = createSessionToken();
    const response = NextResponse.json({
      ok: true,
      message: "PASSWORD_UPDATED: Admin password successfully changed and persisted.",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      ...COOKIE_OPTIONS,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error changing password." },
      { status: 500 }
    );
  }
}
