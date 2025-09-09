import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

export const REGISTERED_PROVIDER_PREFIX = "registered:target:provider";

async function protectedGET(req: PayloadRequest) {

  try {
    let allKeys: string[] = [];
    let cursor = 0
    // scan returns a tuple [new cursor, keys]
    do {
      const [newCursor, keys] = await redis.scan(cursor, { match: `${REGISTERED_PROVIDER_PREFIX}:*`, count: 100 });
      if (keys.length > 0) {
        allKeys = allKeys.concat(keys);
      }
      cursor = Number(newCursor);
    } while (cursor !== 0);

    let tasks = []
    for (let key of allKeys) {
      tasks.push(redis.get<string>(key));
    }
    allKeys = (await Promise.all(tasks)).filter((item): item is string => item !== null);

    return NextResponse.json(allKeys);
  } catch (error) {
    console.error(error);
    return NextResponse.json([]);
  }
}

export const GET = withAuth(protectedGET);
