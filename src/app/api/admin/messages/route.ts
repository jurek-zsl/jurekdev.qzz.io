import { NextResponse } from "next/server";
import { isAuthenticatedRequest } from "@/lib/auth-server";
import { getSiteData, updateContactMessage, deleteContactMessage } from "@/lib/store-server";

export async function GET(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = getSiteData();
  return NextResponse.json({ messages: data.messages || [] });
}

export async function PATCH(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, read, replied } = body || {};

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updates: { read?: boolean; replied?: boolean } = {};
    if (typeof read === "boolean") updates.read = read;
    if (typeof replied === "boolean") updates.replied = replied;

    const success = updateContactMessage(id, updates);
    if (!success) {
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Status updated" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAuthenticatedRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const success = deleteContactMessage(id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Message removed from inbox" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
