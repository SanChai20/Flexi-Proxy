import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { jwtSign } from "@/lib/jwt";

// POST
// API: '/api/auth/exchange'
// Headers: Authorization Bearer <Token>
async function protectedPOST(req: AuthRequest) {
  if (process.env.AUTHTOKEN_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const { token: jwtToken, error } = await jwtSign();
    if (jwtToken === undefined) {
      return NextResponse.json({ error }, { status: 500 });
    }
    const token = crypto.randomUUID();
    const transaction = redis.multi();
    transaction.set<string>(
      [process.env.AUTHTOKEN_PREFIX, token].join(":"),
      jwtToken,
      { ex: 7200 }
    );
    transaction.del([process.env.AUTHTOKEN_PREFIX, req.token].join(":"));
    await transaction.exec();
    return NextResponse.json({ token, expiresIn: 7200 }, { status: 200 });
  } catch (error) {
    console.error("Failed to exchange token: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
