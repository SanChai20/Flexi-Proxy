import { redis } from "@/lib/database";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { REGISTERED_PROVIDER_PREFIX } from "@/app/api/providers/route";
import { jwtSign } from "@/lib/jwt";

const USER_ADAPTER_PREFIX = "user:adapter:list";

// [Internal] Create Adapter
async function protectedPOST(req: PayloadRequest) {
  if (
    !req.payload ||
    typeof req.payload["user_id"] !== "string"
  ) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const { provider_id, base_url, api_key, model_id } = await req.json()
  if (!provider_id || !base_url || !api_key || !model_id) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const provider_url = await redis.get<string>(
    [REGISTERED_PROVIDER_PREFIX, provider_id].join(":")
  );
  if (!provider_url) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }
  // Sign
  const token = await jwtSign({ provider_id, base_url, api_key, model_id })
  if (token === undefined) {
    return NextResponse.json({ error: "Authorize failed" }, { status: 401 });
  }
  // Save
  const adapterRaw = {
    target: provider_id,
    url: provider_url,
  };
  const adapter = JSON.stringify(adapterRaw);
  await redis.set<string>([USER_ADAPTER_PREFIX, req.payload["user_id"], token].join(":"), adapter);
  return NextResponse.json(adapterRaw);
}
export const POST = withAuth(protectedPOST);

// [Internal] Get Adapters
async function protectedGET(req: PayloadRequest) {
  if (!req.payload || typeof req.payload["user_id"] !== "string") {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  // try {
  //   let allKeys: string[] = [];
  //   let cursor = 0
  //   // scan returns a tuple [new cursor, keys]
  //   do {
  //     const [newCursor, keys] = await redis.scan(cursor, { match: `${USER_ADAPTER_PREFIX}:${req.payload["user_id"]}:*`, count: 100 });
  //     if (keys.length > 0) {
  //       allKeys = allKeys.concat(keys);
  //     }
  //     cursor = Number(newCursor);
  //   } while (cursor !== 0);

  //   let tasks = []
  //   for (let key of allKeys) {
  //     tasks.push(redis.get<string>(key));
  //   }
  //   allKeys = (await Promise.all(tasks)).filter((item): item is string => item !== null);

  //   return NextResponse.json(allKeys);
  // } catch (error) {
  //   console.error(error);
  //   return NextResponse.json([]);
  // }






  // const results: { target: string; token: string; url: string }[] = (
  //   await redis.lrange<string>(
  //     [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
  //     0,
  //     -1
  //   )
  // ).map((item) => JSON.parse(item));
  return NextResponse.json(results);
}
export const GET = withAuth(protectedGET);

// [Internal] Delete Adapter
async function protectedDELETE(req: PayloadRequest) {
  if (
    !req.payload ||
    typeof req.payload["user_id"] !== "string"
  ) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const { adapter_token } = await req.json()
  if (!adapter_token) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  await redis.del([USER_ADAPTER_PREFIX, req.payload["user_id"], adapter_token].join(":"));
  return NextResponse.json({ token: adapter_token });
}
export const DELETE = withAuth(protectedDELETE);
