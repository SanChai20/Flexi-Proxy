import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { jwtSign } from "@/lib/jwt";
import { revalidateTag } from "next/cache";

export const preferredRegion = ["iad1", "cle1"];

const ENV = {
  AUTHTOKEN_PREFIX: process.env.AUTHTOKEN_PREFIX!,
  PROXY_PREFIX: process.env.PROXY_PREFIX!,
} as const;

// POST
// API: '/api/auth/exchange'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] uid -> owner user id
//  [string] url -> provider proxy url
//  [string] status -> provider proxy status ["unavailable", "spare", "busy", "full"]
//  [string] id -> provider id
//}
async function protectedPOST(req: AuthRequest) {
  if (ENV.AUTHTOKEN_PREFIX === undefined || ENV.PROXY_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const { uid, url, status, id } = await req.json();
    if (
      typeof uid !== "string" ||
      typeof url !== "string" ||
      typeof status !== "string" ||
      typeof id !== "string"
    ) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }

    const { token: jwtToken, error } = await jwtSign();
    if (jwtToken === undefined) {
      return NextResponse.json({ error }, { status: 500 });
    }
    const token = crypto.randomUUID();
    const transaction = redis.multi();
    transaction.set<string>([ENV.AUTHTOKEN_PREFIX, token].join(":"), jwtToken, {
      ex: 14400,
    });
    transaction.del([ENV.AUTHTOKEN_PREFIX, req.token].join(":"));
    transaction.set<{ url: string; status: string }>(
      [ENV.PROXY_PREFIX, uid, id].join(":"),
      { url, status },
      { ex: 14400 }
    );
    await transaction.exec();
    revalidateTag("private-proxy-servers");
    return NextResponse.json({ token, expiresIn: 14400 }, { status: 200 });
  } catch (error) {
    console.error("Failed to exchange token: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
