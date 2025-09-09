import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

export const REGISTERED_PROVIDERS_KEY = "registered:target:providers";
export const REGISTERED_PROVIDER_PREFIX = "registered:target:provider";

async function protectedGET(req: PayloadRequest) {
  const ids: string[] = await redis.lrange<string>(
    REGISTERED_PROVIDERS_KEY,
    0,
    -1
  );
  return NextResponse.json(ids);
}

export const GET = withAuth(protectedGET);
