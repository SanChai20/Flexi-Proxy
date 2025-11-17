import { asymmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";
import { redis } from "@/lib/redis";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

export const preferredRegion = ["iad1", "cle1"];

const ENV = {
  ADAPTER_PREFIX: process.env.ADAPTER_PREFIX!,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
};

// POST
// API: '/api/auth/validate'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'X-Proxy-Id': From Proxy Server
//          'Authorization': Bearer <Token>
async function protectedPOST(req: AuthRequest) {
  if (ENV.ADAPTER_PREFIX === undefined || ENV.ENCRYPTION_KEY === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
    if (tk === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const pid: string | null = req.headers.get("X-Proxy-Id");
    if (pid === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const tokenData: {
      uid: string;
      mid: string;
    } | null = await redis.get<{
      uid: string;
      mid: string;
    }>([ENV.ADAPTER_PREFIX, tk].join(":"));
    if (tokenData === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ...tokenData }, { status: 200 });
  } catch (error) {
    console.error("Failed to request key: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
