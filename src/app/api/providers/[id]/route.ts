import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import {
  REGISTERED_PROVIDERS_KEY,
  REGISTERED_PROVIDER_PREFIX,
} from "@/app/api/providers/route";

// Get the provider by id
async function protectedGET(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  const provider = await redis.get<string>(
    [REGISTERED_PROVIDER_PREFIX, id].join(":")
  );
  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }
  return NextResponse.json(JSON.parse(provider));
}
export const GET = withAuth(protectedGET);

// [EXTERNAL] Create the provider
async function protectedPOST(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  if (!req.payload || typeof req.payload["url"] !== "string") {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }
  const position = await redis.lpos<number | null>(
    REGISTERED_PROVIDERS_KEY,
    id
  );
  if (position !== null) {
    return NextResponse.json({ error: "Provider existed" }, { status: 409 });
  }
  const tx = redis.multi();
  tx.rpush<string>(REGISTERED_PROVIDERS_KEY, id);
  tx.set<string>(
    [REGISTERED_PROVIDER_PREFIX, id].join(":"),
    req.payload["url"]
  );
  const res = await tx.exec();
  return NextResponse.json({ success: true });
}
export const POST = withAuth(protectedPOST);

// [EXTERNAL] Update the provider
async function protectedPATCH(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  if (!req.payload || typeof req.payload["url"] !== "string") {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }

  const position = await redis.lpos<number | null>(
    REGISTERED_PROVIDERS_KEY,
    id
  );
  if (position === null) {
    return NextResponse.json(
      { error: "Provider not existed" },
      { status: 409 }
    );
  }
  await redis.set<string>(
    [REGISTERED_PROVIDER_PREFIX, id].join(":"),
    req.payload["url"]
  );
  return NextResponse.json({ success: true });
}
export const PATCH = withAuth(protectedPATCH);

// [EXTERNAL] Delete the provider
async function protectedDELETE(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  const tx = redis.multi();
  tx.lrem<string>(REGISTERED_PROVIDERS_KEY, 1, id);
  tx.del([REGISTERED_PROVIDER_PREFIX, id].join(":"));
  const res = await tx.exec();
  return NextResponse.json({ success: true });
}
export const DELETE = withAuth(protectedDELETE);
