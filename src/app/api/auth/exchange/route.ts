import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { jwtSign } from "@/lib/jwt";
import { revalidateTag } from "next/cache";

const TOKEN_EXPIRY = 3600; // 1 hour
const VALID_STATUSES = ["unavailable", "spare", "busy", "full"] as const;
const ENV = {
  AUTHTOKEN_PREFIX: process.env.AUTHTOKEN_PREFIX!,
  PROXY_PREFIX: process.env.PROXY_PREFIX!,
} as const;

interface ExchangeRequestBody {
  url: string;
  status: (typeof VALID_STATUSES)[number];
  adv: boolean;
  id: string;
}

interface ProxyData {
  url: string;
  status: string;
  adv: boolean;
}

const RedisKeys = {
  authToken: (token: string) => `${ENV.AUTHTOKEN_PREFIX}:${token}`,
  proxy: (id: string) => `${ENV.PROXY_PREFIX}:${id}`,
} as const;

function validateRequestBody(data: unknown): data is ExchangeRequestBody {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;

  return (
    typeof d.url === "string" &&
    d.url.length > 0 &&
    typeof d.status === "string" &&
    VALID_STATUSES.includes(d.status as any) &&
    typeof d.adv === "boolean" &&
    typeof d.id === "string" &&
    d.id.length > 0
  );
}

// POST
// API: '/api/auth/exchange'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] url -> provider proxy url
//  [string] status -> provider proxy status ["unavailable", "spare", "busy", "full"]
//  [boolean] adv -> if advanced or not
//  [string] id -> provider id
//}
async function protectedPOST(req: AuthRequest) {
  try {
    const body = await req.json();

    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    const { url, status, adv, id } = body;
    const newToken = crypto.randomUUID();
    const { token: jwtToken, error: jwtError } = await jwtSign();

    if (!jwtToken) {
      console.error("JWT signing failed:", jwtError);
      return NextResponse.json(
        { error: jwtError || "Failed to generate token" },
        { status: 500 }
      );
    }
    const transaction = redis.multi();
    transaction.set<string>(RedisKeys.authToken(newToken), jwtToken, {
      ex: TOKEN_EXPIRY,
    });
    transaction.del(RedisKeys.authToken(req.token));
    transaction.set<ProxyData>(
      RedisKeys.proxy(id),
      { url, status, adv },
      { ex: TOKEN_EXPIRY }
    );
    await transaction.exec();
    Promise.resolve().then(() => revalidateTag("proxy-servers"));
    return NextResponse.json(
      {
        token: newToken,
        expiresIn: TOKEN_EXPIRY,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to exchange token:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
