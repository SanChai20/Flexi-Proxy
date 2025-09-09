import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import {
  REGISTERED_PROVIDER_PREFIX,
} from "@/app/api/providers/route";

// Get the provider by id
async function protectedGET(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  const provider_url = await redis.get<string>([REGISTERED_PROVIDER_PREFIX, id].join(":"));
  if (!provider_url) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }
  return NextResponse.json(JSON.parse(provider_url));
}
export const GET = withAuth(protectedGET);

// [EXTERNAL] Create or update the provider
async function protectedPOST(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  if (!req.payload || typeof req.payload["url"] !== "string") {
    return NextResponse.json({ error: "Missing field" }, { status: 400 });
  }
  await redis.set<string>([REGISTERED_PROVIDER_PREFIX, id].join(":"), JSON.stringify({ url: req.payload["url"] }));
  return NextResponse.json({ success: true });
}
export const POST = withAuth(protectedPOST);

// [EXTERNAL] Delete the provider
async function protectedDELETE(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Provider ID is required" },
      { status: 400 }
    );
  }
  await redis.del([REGISTERED_PROVIDER_PREFIX, id].join(":"));
  return NextResponse.json({ success: true });
}
export const DELETE = withAuth(protectedDELETE);
