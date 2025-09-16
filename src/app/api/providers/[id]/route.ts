import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

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
