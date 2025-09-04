import { verify } from "@/lib/security";
import { BaseAdapter } from "@/lib/utils";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const USER_ADAPTER_PREFIX = "user:adapter:list";

// Create Adapter
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { payload, error } = await verify(token);
  if (!payload) {
    return NextResponse.json({ error }, { status: 401 });
  }
  const responseData = (await fetch(
    [process.env.BACKEND_URL, "v1/adapter"].join("/"),
    {
      method: "POST",
      headers: { Authorization: authHeader },
    }
  ).then((res) => res.json())) as {
    success: boolean;
    token: string;
    url: string;
  };

  if (!responseData.success) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
  // Save
  const adapter = {
    provider: payload["provider"] as string,
    token: responseData.token,
    url: responseData.url,
  };
  await redis.rpush<BaseAdapter>(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    adapter
  );
  return NextResponse.json(adapter);
}

// Get Adapter
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { payload, error } = await verify(token);
  if (!payload) {
    return NextResponse.json({ error }, { status: 401 });
  }
  const results: BaseAdapter[] = await redis.lrange<BaseAdapter>(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    0,
    -1
  );
  return NextResponse.json(results);
}

// Delete Adapter
export async function DELETE(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { payload, error } = await verify(token);
  if (!payload) {
    return NextResponse.json({ error }, { status: 401 });
  }
  const delete_index = payload["delete_index"] as number;
  const delete_item: BaseAdapter = await redis.lindex(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    delete_index
  );
  const removed_count = await redis.lrem<BaseAdapter>(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    1,
    delete_item
  );
  console.log(removed_count);
  return NextResponse.json({ success: true });
}
