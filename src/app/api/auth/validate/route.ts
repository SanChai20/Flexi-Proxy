import { redis } from "@/lib/redis";
import { AuthRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/auth/validate'
// Headers: 'X-API-Key': <Token start from 'fp-'>
//          'Authorization': Bearer <Token>
async function protectedGET(req: AuthRequest) {
  // Get Token data
  if (process.env.ADAPTER_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const tk: string | null = req.headers.get("X-API-Key");
    if (tk === null) {
      return NextResponse.json({ error: "Missing Field" }, { status: 400 });
    }
    const count = await redis.exists(
      [process.env.ADAPTER_PREFIX, tk].join(":")
    );
    if (count > 0) {
      return NextResponse.json({ msg: "success" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (error) {
    console.error("Failed to validate key: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
