import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/settings'
// Headers: Authorization Bearer Token(uid)
async function protectedGET(req: PayloadRequest) {
  // Get Settings data
  if (!process.env.SETTINGS_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tokenData: null = await redis.get<{
      uid: string;
      kiv: string;
      ken: string;
      kau: string;
      url: string;
      mid: string;
    }>([process.env.ADAPTER_PREFIX, tk].join(":"));
    if (tokenData !== null) {
      return NextResponse.json(tokenData, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to get token data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST
// API: '/api/settings'
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
    const { cd } = await req.json();
    if (!tk) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const tokenData: {
      uid: string;
      kiv: string;
      ken: string;
      kau: string;
      url: string;
      mid: string;
    } | null = await redis.get<{
      uid: string;
      kiv: string;
      ken: string;
      kau: string;
      url: string;
      mid: string;
    }>([process.env.ADAPTER_PREFIX, tk].join(":"));
    if (tokenData !== null) {
      return NextResponse.json(tokenData, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to get token data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
