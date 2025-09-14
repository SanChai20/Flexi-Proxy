import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { REGISTERED_PROVIDER_PREFIX } from "@/lib/utils";

async function protectedGET(req: PayloadRequest) {
  const searchPatternPrefix = `${REGISTERED_PROVIDER_PREFIX}:`;
  try {
    // Scan all keys with the prefix
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
      const ids = allKeys.map((key) => key.replace(searchPatternPrefix, ""));
      const values = await redis.mget<{ url: string }[]>(...allKeys);
      return NextResponse.json(
        ids.map((id, index) => ({
          id,
          ...(values[index] || {}),
        }))
      );
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export const GET = (protectedGET);
