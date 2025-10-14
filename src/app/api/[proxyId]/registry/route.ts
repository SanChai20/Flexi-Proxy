import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";

// POST
// API: '/api/{proxyId}/registry'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] provider A -> models set
//}
async function protectedPOST(req: AuthRequest, { params }: { params: Promise<{ proxyId: string }> }) {
    if (process.env.PROXY_MODELS_PREFIX === undefined) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
    try {
        const { proxyId } = await params;
        const { models_by_provider } = await req.json();
        await redis.set([process.env.PROXY_MODELS_PREFIX, proxyId].join(":"), models_by_provider);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Failed to registry models: ", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export const POST = withAuth(protectedPOST);