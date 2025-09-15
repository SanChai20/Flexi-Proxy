import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { USER_ADAPTER_PREFIX } from "@/lib/utils";

// [Internal] Get Adapters
async function protectedGET(req: PayloadRequest) {
  try {
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const searchPatternPrefix = `${USER_ADAPTER_PREFIX}:${req.payload["uid"]}:`;

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
      const createTimes = allKeys.map((key) =>
        key.replace(searchPatternPrefix, "")
      );
      const values = await redis.mget<
        {
          provider_id: string;
          provider_url: string;
          base_url: string;
          model_id: string;
        }[]
      >(...allKeys);
      return NextResponse.json(
        createTimes.map((create_time, index) => ({
          create_time,
          ...(values[index] || {}),
        }))
      );
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error("Failed to fetch adapters: ", error);
    return NextResponse.json(
      { error: "Failed to fetch adapters" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(protectedGET);
