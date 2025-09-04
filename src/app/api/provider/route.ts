import { redis } from "@/lib/database";
import { verify } from "@/lib/security";
import { TargetProvider } from "@/lib/utils";
import { NextResponse } from "next/server";

const ADAPTER_PROVIDER_KEY = "registered:target:providers";

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
  const results: TargetProvider[] = (
    await redis.lrange<string>(ADAPTER_PROVIDER_KEY, 0, -1)
  ).map((item) => JSON.parse(item));
  return NextResponse.json(results);
}

// [CALL EXTERNAL] Register target provider
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
  const target_provider: TargetProvider = {
    id: payload["id"],
    name: payload["name"],
  };
  const push_count: number = await redis.rpush<string>(
    ADAPTER_PROVIDER_KEY,
    JSON.stringify(target_provider)
  );
  return NextResponse.json({ success: true });
}

// [CALL EXTERNAL] UnRegister target provider
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
  const target_provider: TargetProvider = {
    id: payload["id"],
    name: payload["name"],
  };
  const remove_count: number = await redis.lrem<string>(
    ADAPTER_PROVIDER_KEY,
    1,
    JSON.stringify(target_provider)
  );
  return NextResponse.json({ success: true });
}
