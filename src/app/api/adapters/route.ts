import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/adapters'
// Headers: Authorization Bearer Token(uid)
async function protectedGET(req: PayloadRequest) {
  // Get Adapters
  if (process.env.ADAPTER_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    if (typeof req.payload?.["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const searchPatternPrefix = `${process.env.ADAPTER_PREFIX}:${req.payload["uid"]}:`;

    let allKeys: string[] = [];
    let cursor = 0;
    do {
      const [newCursor, keys] = await redis.scan(cursor, {
        match: `${searchPatternPrefix}*`,
        count: 100,
      });
      allKeys.push(...keys);
      cursor = Number(newCursor);
    } while (cursor !== 0);
    if (allKeys.length > 0) {
      const adapterIds = allKeys.map((key) =>
        key.replace(searchPatternPrefix, "")
      );
      const values = await redis.mget<
        {
          tk: string;
          pid: string;
          pul: string;
          not: string;
        }[]
      >(...allKeys);
      return NextResponse.json(
        adapterIds.map((adapterId, index) => ({
          aid: adapterId,
          ...(values[index] || {}),
        }))
      );
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error("Failed to fetch adapters: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const GET = withAuth(protectedGET);
