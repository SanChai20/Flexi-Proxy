import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { jwtSign } from "@/lib/jwt";

// POST
// API: '/api/auth/exchange'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] url -> provider proxy url
//  [string] status -> provider proxy status ["unavailable", "spare", "busy", "full"]
//  [number] ex -> expire seconds
//  [boolean] adv -> if advanced or not
//  [string] id -> provider id
//}
async function protectedPOST(req: AuthRequest) {
  if (
    process.env.AUTHTOKEN_PREFIX === undefined ||
    process.env.PROVIDER_PREFIX === undefined
  ) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const { url, status, ex, adv, id } = await req.json();
    if (
      typeof url !== "string" ||
      typeof status !== "string" ||
      typeof ex !== "number" ||
      typeof adv !== "boolean" ||
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
    transaction.set<string>(
      [process.env.AUTHTOKEN_PREFIX, token].join(":"),
      jwtToken,
      { ex: 7200 }
    );
    transaction.del([process.env.AUTHTOKEN_PREFIX, req.token].join(":"));
    transaction.set<{ url: string; status: string; adv: boolean }>(
      [process.env.PROVIDER_PREFIX, id].join(":"),
      { url, status, adv },
      { ex }
    );
    await transaction.exec();
    return NextResponse.json({ token, expiresIn: 7200 }, { status: 200 });
  } catch (error) {
    console.error("Failed to exchange token: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
