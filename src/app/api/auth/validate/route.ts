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
// Body: {
//  public_key: <Public secret key issued from verified server>
//}
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
    const { public_key } = await req.json();
    if (typeof public_key !== "string") {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const tokenData: {
      uid: string;
      pro: string;
      mid: string;
      llm: string;
    } | null = await redis.get<{
      uid: string;
      pro: string;
      mid: string;
      llm: string;
    }>([ENV.ADAPTER_PREFIX, tk].join(":"));
    if (tokenData === null) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const tokenKeyData: {
      kiv: string;
      ken: string;
      kau: string;
    } | null = await redis.get<{
      kiv: string;
      ken: string;
      kau: string;
    }>([ENV.ADAPTER_PREFIX, pid, tk].join(":"));
    if (tokenKeyData != null) {
      const apiKey = symmetricDecrypt(
        {
          iv: tokenKeyData.kiv,
          encryptedData: tokenKeyData.ken,
          authTag: tokenKeyData.kau,
        },
        ENV.ENCRYPTION_KEY
      );
      const data = asymmetricEncrypt(apiKey, public_key);
      return NextResponse.json(
        { enc: data.encryptedData, ...tokenData },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to request key: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
