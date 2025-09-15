import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

// GET
// API: '/api/providers/[id]'
// Headers: Authorization Bearer Token
// Body: {
//  [string] url -> provider proxy url
//}
async function protectedGET(
  req: PayloadRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Get the provider by id
  if (!process.env.PROVIDER_PREFIX) {
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
  try {
    const providerId = (await params).id;
    const provider: { url: string } | null = await redis.get<{ url: string }>(
      [process.env.PROVIDER_PREFIX, providerId].join(":")
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
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}


// POST
// API: '/api/providers/[id]'
// Headers: Authorization Bearer Token
// Body: {
//  [string] url -> provider proxy url
//}
async function protectedPOST(
  req: PayloadRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create or update the provider
  if (!process.env.PROVIDER_PREFIX) {
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }

  try {
    const providerId = (await params).id;
    const { url } = await req.json();
    if (typeof url !== 'string') {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    await redis.set<{ url: string }>(
      [process.env.PROVIDER_PREFIX, providerId].join(":"), { url }
    );
    return NextResponse.json(undefined, { status: 200 });
  } catch (error) {
    console.error("Failed to create provider: ", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

// DELETE
// API: '/api/providers/[id]'
// Headers: Authorization Bearer Token
async function protectedDELETE(
  req: PayloadRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Delete the provider
  if (!process.env.PROVIDER_PREFIX) {
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
  try {
    const providerId = (await params).id;
    await redis.del([process.env.PROVIDER_PREFIX, providerId].join(":"));
    return NextResponse.json(undefined, { status: 200 });
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
