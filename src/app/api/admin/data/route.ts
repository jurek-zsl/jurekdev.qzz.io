import { NextResponse } from "next/server";
import { getSiteData, saveSiteData } from "@/lib/store-server";
import { SiteData } from "@/lib/store-types";
import { isAuthenticatedRequest } from "@/lib/auth-server";

export async function GET() {
  const data = getSiteData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    if (!isAuthenticatedRequest(request)) {
      return NextResponse.json(
        { error: "UNAUTHORIZED: Real administrative authentication required." },
        { status: 401 }
      );
    }

    const body: SiteData = await request.json();

    if (!body || !Array.isArray(body.posts) || !Array.isArray(body.projects)) {
      return NextResponse.json(
        { error: "Invalid data schema: posts and projects arrays are required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.skills)) {
      body.skills = [];
    }

    const success = saveSiteData(body);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to persist data to server disk." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Site data saved successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
