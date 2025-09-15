import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { REGISTERED_PROVIDER_PREFIX } from "@/lib/utils";

// [BOTH] Get the provider by id
async function protectedGET(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Provider ID is required" },
        { status: 400 }
      );
    }
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [REGISTERED_PROVIDER_PREFIX, id].join(":")
    );
    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(provider);
  } catch (error) {
    console.error("Failed to get provider: ", error);
    return NextResponse.json(
      { error: "Failed to get provider" },
      { status: 500 }
    );
  }
}

// [EXTERNAL ONLY] Create or update the provider
async function protectedPOST(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    await redis.set<{ url: string }>(
      [REGISTERED_PROVIDER_PREFIX, id].join(":"),
      {
        url: req.payload["url"],
      }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to create provider: ", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

// [EXTERNAL ONLY] Delete the provider
async function protectedDELETE(
  req: PayloadRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Provider ID is required" },
        { status: 400 }
      );
    }
    await redis.del([REGISTERED_PROVIDER_PREFIX, id].join(":"));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete provider: ", error);
    return NextResponse.json(
      { error: "Failed to delete provider" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);
export const DELETE = withAuth(protectedDELETE);
