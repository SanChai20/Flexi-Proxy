import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/token'
// Headers: Authorization Bearer Token(tk)
async function protectedGET(req: PayloadRequest) {
  // Get Token data
  if (!process.env.ADAPTER_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
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
