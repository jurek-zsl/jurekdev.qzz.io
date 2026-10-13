import { NextResponse } from "next/server";
import { addContactMessage } from "@/lib/store-server";

// In-memory rate limiting map: IP -> timestamps[]
const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxSubmissions = 5;

  const timestamps = rateLimits.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxSubmissions) {
    rateLimits.set(ip, recent);
    return false;
  }

  recent.push(now);
  rateLimits.set(ip, recent);
  return true;
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "RATE_LIMIT_EXCEEDED: Maximum 5 messages per 5 minutes. Please wait before transmitting again." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, type, message } = body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Sender name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Sender email is required." }, { status: 400 });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Invalid email address format." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message buffer content cannot be empty." }, { status: 400 });
    }

    const saved = addContactMessage({
      name: name.trim(),
      email: email.trim(),
      type: type && typeof type === "string" ? type.trim() : "PROJECT INQUIRY",
      message: message.trim(),
    });

    return NextResponse.json({
      ok: true,
      message: "BUFFER_RECEIVED_200_OK: Message delivered and queued in administrative inbox.",
      id: saved.id,
      timestamp: saved.createdAt,
    });
  } catch (err) {
    console.error("Error processing contact transmission:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal transmission failure" },
      { status: 500 }
    );
  }
}
