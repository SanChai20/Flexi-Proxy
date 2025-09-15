import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { REGISTERED_PROVIDER_PREFIX, USER_ADAPTER_PREFIX } from "@/lib/utils";

// [Internal] Create Adapter
async function protectedPOST(req: PayloadRequest) {
  try {
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { provider_id, base_url, model_id } = await req.json();
    if (!provider_id || !base_url || !model_id) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [REGISTERED_PROVIDER_PREFIX, provider_id].join(":")
    );
    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }
    // Save
    const create_time = Date.now().toString();
    await redis.set<{
      provider_id: string;
      provider_url: string;
      base_url: string;
      model_id: string;
    }>([USER_ADAPTER_PREFIX, req.payload["uid"], create_time].join(":"), {
      provider_id,
      provider_url: provider.url,
      base_url,
      model_id,
    });
    return NextResponse.json({
      create_time,
    });
  } catch (error) {
    console.error("Failed to create adapter: ", error);
    return NextResponse.json(
      { error: "Failed to create adapter" },
      { status: 500 }
    );
  }
}

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
      { error: "Failed to fetch adapter" },
      { status: 500 }
    );
  }
}

// [Internal] Delete Adapter
async function protectedDELETE(req: PayloadRequest) {
  try {
    if (!req.payload || typeof req.payload["uid"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { create_time } = await req.json();
    if (!create_time) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    await redis.del(
      [USER_ADAPTER_PREFIX, req.payload["uid"], create_time].join(":")
    );
    return NextResponse.json({ create_time });
  } catch (error) {
    console.error("Failed to delete adapter: ", error);
    return NextResponse.json(
      { error: "Failed to delete adapter" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
export const DELETE = withAuth(protectedDELETE);
