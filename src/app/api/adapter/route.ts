import { redis } from "@/lib/database";
import { verify } from "@/lib/security";
import { BaseAdapter, TargetProvider } from "@/lib/utils";
import { NextResponse } from "next/server";

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

  const provider_id = payload["provider"] as string
  const provider_array = (await fetch(
    [process.env.BASE_URL, "api/provider"].join("/"),
    {
      method: "GET",
      headers: { Authorization: authHeader },
    }
  ).then((res) => res.json())) as TargetProvider[];

  const check_provider: TargetProvider | undefined = provider_array.map(item => item.id === provider_id)


  if (!responseData.success) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
  // Save
  const adapter: BaseAdapter = {
    provider: payload["provider"] as string,
    token: responseData.token,
    url: responseData.url,
  };
  await redis.rpush<string>(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    JSON.stringify(adapter)
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
  const results: BaseAdapter[] = (
    await redis.lrange<string>(
      [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
      0,
      -1
    )
  ).map((item) => JSON.parse(item));
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
  const delete_item: string = await redis.lindex(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    delete_index
  );
  const removed_count = await redis.lrem<string>(
    [USER_ADAPTER_PREFIX, payload["user_id"]].join(":"),
    1,
    delete_item
  );
  console.log(removed_count);
  return NextResponse.json({ success: true });
}
