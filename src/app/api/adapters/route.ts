import { asymmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";
import { redis } from "@/lib/redis";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { NextRequest, NextResponse } from "next/server";

// GET
// API: '/api/adapters'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'X-Public-Key': <Public secret key issued from verified server>
//          'Authorization': Bearer <Token>
async function protectedGET(req: AuthRequest) {
  // Get Token data
  if (
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.ENCRYPTION_KEY === undefined
  ) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
    if (tk === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    console.warn(`tk: ${tk}`)
    const { public_key } = await req.json();
    if (typeof public_key !== "string") {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    console.warn(`public_key: ${public_key}`)
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

    console.warn(`tokenData: ${JSON.stringify(tokenData)}`)
    if (tokenData !== null) {
      console.warn(`apiKey: before111111111111111111111111111`)
      const apiKey = symmetricDecrypt(
        {
          iv: tokenData.kiv,
          encryptedData: tokenData.ken,
          authTag: tokenData.kau,
        },
        process.env.ENCRYPTION_KEY
      );
      console.warn(`apiKey: ${apiKey}`)
      const data = asymmetricEncrypt(apiKey, public_key);
      console.warn(`data: ${data.encryptedData}`)
      return NextResponse.json(
        {
          uid: tokenData.uid,
          url: tokenData.url,
          mid: tokenData.mid,
          enc: data.encryptedData,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to get token data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
