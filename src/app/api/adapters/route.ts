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
    token,
    url: provider_url,
  };
  const adapter = JSON.stringify(adapterRaw);
  const queryKey = [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":");
  const position = await redis.lpos<number | null>(queryKey, adapter);
  if (position !== null) {
    return NextResponse.json({ error: "Adapter existed" }, { status: 409 });
  }
  await redis.rpush<string>(queryKey, adapter);
  return NextResponse.json(adapterRaw);
}
export const POST = withAuth(protectedPOST);

// [Internal] Get Adapters
async function protectedGET(req: PayloadRequest) {
  if (!req.payload || typeof req.payload["user_id"] !== "string") {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }
  const results: { target: string; token: string; url: string }[] = (
    await redis.lrange<string>(
      [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
      0,
      -1
    )
  ).map((item) => JSON.parse(item));
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

  const { delete_index } = await req.json()
  if (!delete_index) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const delete_item: string = await redis.lindex(
    [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
    delete_index
  );
  const removed_count = await redis.lrem<string>(
    [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
    1,
    delete_item
  );

  return NextResponse.json(JSON.parse(delete_item));
}
export const DELETE = withAuth(protectedDELETE);
