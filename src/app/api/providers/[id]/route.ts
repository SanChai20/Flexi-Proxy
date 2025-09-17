import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";

// POST
// API: '/api/providers/[id]'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] url -> provider proxy url
//  [string] status -> provider proxy status ["unavailable", "spare", "busy", "full"]
//  [number] ex -> expire seconds
//}
async function protectedPOST(
  req: AuthRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Create or update the provider
  if (process.env.PROVIDER_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }

  try {
    const providerId = (await params).id;
    const { url, status, ex } = await req.json();
    if (
      typeof url !== "string" ||
      typeof status !== "string" ||
      typeof ex !== "number"
    ) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    await redis.set<{ url: string; status: string }>(
      [process.env.PROVIDER_PREFIX, providerId].join(":"),
      { url, status },
      { ex }
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to create provider: ", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(protectedPOST);
