import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/user/settings'
// Headers: Authorization Bearer Token(uid)
async function protectedGET(req: PayloadRequest) {
  // Get Settings data
  if (!process.env.SETTINGS_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    if (typeof req.payload?.["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const settings: any | null = await redis.get(
      [process.env.SETTINGS_PREFIX, req.payload["uid"]].join(":")
    );
    if (settings !== null) {
      return NextResponse.json(settings, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to get settings data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST
// API: '/api/user/settings'
// Headers: Authorization Bearer Token(uid)
// Body: {
//  [boolean] cd -> collect data
//}
async function protectedPOST(req: PayloadRequest) {
  // Create or update settings data
  if (!process.env.SETTINGS_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    if (typeof req.payload?.["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    await redis.set<string>(
      [process.env.SETTINGS_PREFIX, req.payload["uid"]].join(":"),
      {
        ...(await req.json()),
      }
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to get settings data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
