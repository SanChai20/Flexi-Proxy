import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/user/permissions'
// Headers: Authorization Bearer Token(uid)
async function protectedGET(req: PayloadRequest) {
  // Get permissions data
  if (!process.env.PERMISSIONS_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    if (typeof req.payload?.["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const permissions: any | null = await redis.get(
      [process.env.PERMISSIONS_PREFIX, req.payload["uid"]].join(":")
    );
    if (permissions !== null) {
      return NextResponse.json(permissions, { status: 200 });
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Failed to get permissions data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

// POST
// API: '/api/user/permissions'
// Headers: Authorization Bearer Token(uid)
// Body: {
//  [number] maa -> maxAdaptersAllowed
//}
async function protectedPOST(req: PayloadRequest) {
  // Create or update permissions data
  if (!process.env.PERMISSIONS_PREFIX) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    if (typeof req.payload?.["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const permissions: any | null = await redis.get(
      [process.env.PERMISSIONS_PREFIX, req.payload["uid"]].join(":")
    );
    await redis.set<string>(
      [process.env.PERMISSIONS_PREFIX, req.payload["uid"]].join(":"),
      {
        ...(permissions !== null ? permissions : {}),
        ...(await req.json()),
      }
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to get permissions data: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
