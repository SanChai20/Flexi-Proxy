import { redis } from "@/lib/database";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { REGISTERED_PROVIDER_PREFIX } from "@/app/api/providers/route";
import { jwtSign } from "@/lib/jwt";

const USER_ADAPTER_PREFIX = "user:adapter:list";

// [Internal] Create Adapter
async function protectedPOST(req: PayloadRequest) {
  try {
    if (!req.payload || typeof req.payload["user_id"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { provider_id, base_url, api_key, model_id } = await req.json();
    if (!provider_id || !base_url || !api_key || !model_id) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [REGISTERED_PROVIDER_PREFIX, provider_id].join(":")
    );
    if (!provider) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }
    // Sign
    const token = await jwtSign({ provider_id, base_url, api_key, model_id });
    if (token === undefined) {
      return NextResponse.json({ error: "Authorize failed" }, { status: 401 });
    }
    // Save
    const adapter = {
      target: provider_id,
      url: provider.url,
    };
    await redis.set<{ target: string; url: string }>(
      [USER_ADAPTER_PREFIX, req.payload["user_id"], token].join(":"),
      adapter
    );
    return NextResponse.json({
      token,
      ...adapter,
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
    if (!req.payload || typeof req.payload["user_id"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const searchPatternPrefix = `${USER_ADAPTER_PREFIX}:${req.payload["user_id"]}:`;

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
      const tokens = allKeys.map((key) => key.replace(searchPatternPrefix, ""));
      const values = await redis.mget<{ target: string; url: string }[]>(
        ...allKeys
      );
      return NextResponse.json(
        tokens.map((token, index) => ({
          token,
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

// [Internal] Delete Adapter
async function protectedDELETE(req: PayloadRequest) {
  try {
    if (!req.payload || typeof req.payload["user_id"] !== "string") {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const { adapter_token } = await req.json();
    if (!adapter_token) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    await redis.del(
      [USER_ADAPTER_PREFIX, req.payload["user_id"], adapter_token].join(":")
    );
    return NextResponse.json({ token: adapter_token });
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
