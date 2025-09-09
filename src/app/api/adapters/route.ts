import { redis } from "@/lib/database";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";
import { REGISTERED_PROVIDER_PREFIX } from "@/app/api/providers/route";

const USER_ADAPTER_PREFIX = "user:adapter:list";

// [Internal] Create Adapter
async function protectedPOST(req: PayloadRequest) {
  if (
    !req.payload ||
    !req.token ||
    typeof req.payload["provider_id"] !== "string" ||
    typeof req.payload["user_id"] !== "string"
  ) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }
  const provider_id = req.payload["provider_id"];
  const provider = await redis.get<string>(
    [REGISTERED_PROVIDER_PREFIX, provider_id].join(":")
  );
  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }
  const providerParsed = JSON.parse(provider);
  // Save
  const adapterRaw = {
    target: provider_id,
    token: req.token,
    url: providerParsed.url,
  };
  const adapter = JSON.stringify(adapterRaw);
  const queryKey = [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":");
  const position = await redis.lpos(queryKey, adapter);
  if (!!position) {
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
    typeof req.payload["user_id"] !== "string" ||
    typeof req.payload["delete_index"] !== "number"
  ) {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const delete_index = req.payload["delete_index"];
  const delete_item: string = await redis.lindex(
    [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
    delete_index
  );
  const removed_count = await redis.lrem<string>(
    [USER_ADAPTER_PREFIX, req.payload["user_id"]].join(":"),
    1,
    delete_item
  );
  console.log(removed_count);
  return NextResponse.json({ success: true });
}
export const DELETE = withAuth(protectedDELETE);
