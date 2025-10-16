import { asymmetricEncrypt, symmetricDecrypt } from "@/lib/encryption";
import { redis } from "@/lib/redis";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

interface TokenData {
  uid: string;
  pro: string;
  mid: string;
  llm: string;
}

interface TokenKeyData {
  kiv: string;
  ken: string;
  kau: string;
}

const ENV = {
  ADAPTER_PREFIX: process.env.ADAPTER_PREFIX!,
  ADAPTER_KEY_PREFIX: process.env.ADAPTER_KEY_PREFIX!,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
};

function getRedisKeys(token: string) {
  return {
    tokenKey: `${ENV.ADAPTER_PREFIX}:${token}`,
    keyDataKey: `${ENV.ADAPTER_PREFIX}:${ENV.ADAPTER_KEY_PREFIX}:${token}`,
  };
}

function extractApiKey(req: AuthRequest): string | null {
  return req.headers.get("X-API-Key");
}

// GET
// API: '/api/auth/validate'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'Authorization': Bearer <Token>
async function protectedGET(req: AuthRequest) {
  const tk = extractApiKey(req);
  if (!tk) {
    return NextResponse.json({ error: "Missing Field" }, { status: 400 });
  }

  try {
    const { tokenKey, keyDataKey } = getRedisKeys(tk);

    const pipeline = redis.pipeline();
    pipeline.exists(tokenKey);
    pipeline.exists(keyDataKey);
    const results = await pipeline.exec();
    const bothExist = results?.every((result): boolean => {
      const [err, value] = result as [Error | null, number];
      return !err && value === 1;
    });
    return NextResponse.json(
      bothExist ? { msg: "success" } : { error: "Unauthorized" },
      { status: bothExist ? 200 : 401 }
    );
  } catch (error) {
    console.error("Failed to validate key:", error);
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
  const tk = extractApiKey(req);
  if (!tk) {
    return NextResponse.json({ error: "Missing Field" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const public_key = body?.public_key;

    if (typeof public_key !== "string") {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }

    const { tokenKey, keyDataKey } = getRedisKeys(tk);

    const [tokenData, tokenKeyData] = await Promise.all([
      redis.get<TokenData>(tokenKey),
      redis.get<TokenKeyData>(keyDataKey),
    ]);

    if (!tokenKeyData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const apiKey = symmetricDecrypt(
      {
        iv: tokenKeyData.kiv,
        encryptedData: tokenKeyData.ken,
        authTag: tokenKeyData.kau,
      },
      ENV.ENCRYPTION_KEY
    );

    const { encryptedData } = asymmetricEncrypt(apiKey, public_key);

    return NextResponse.json(
      { enc: encryptedData, ...tokenData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to request key:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
