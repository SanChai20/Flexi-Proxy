import { asymmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";
import { redis } from "@/lib/redis";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/auth/validate'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'Authorization': Bearer <Token>
async function protectedGET(req: AuthRequest) {
  if (
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.ADAPTER_KEY_PREFIX === undefined
  ) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
    if (tk === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const count = await redis.exists(
      [process.env.ADAPTER_PREFIX, tk].join(":"),
      [process.env.ADAPTER_PREFIX, process.env.ADAPTER_KEY_PREFIX, tk].join(":")
    );
    if (count > 1) {
      return NextResponse.json({ msg: "success" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Failed to validate key: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST
// API: '/api/auth/validate'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'Authorization': Bearer <Token>
// Body: {
//  public_key: <Public secret key issued from verified server>
//}
async function protectedPOST(req: AuthRequest) {
  if (
    process.env.ADAPTER_PREFIX === undefined ||
    process.env.ADAPTER_KEY_PREFIX === undefined ||
    process.env.ENCRYPTION_KEY === undefined
  ) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
    if (tk === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const { public_key } = await req.json();
    if (typeof public_key !== "string") {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const tokenKeyData: {
      kiv: string;
      ken: string;
      kau: string;
    } | null = await redis.get<{
      kiv: string;
      ken: string;
      kau: string;
    }>(
      [process.env.ADAPTER_PREFIX, process.env.ADAPTER_KEY_PREFIX, tk].join(":")
    );
    if (tokenKeyData != null) {
      const apiKey = symmetricDecrypt(
        {
          iv: tokenKeyData.kiv,
          encryptedData: tokenKeyData.ken,
          authTag: tokenKeyData.kau,
        },
        process.env.ENCRYPTION_KEY
      );
      const data = asymmetricEncrypt(apiKey, public_key);
      return NextResponse.json({ enc: data.encryptedData }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to request key: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
