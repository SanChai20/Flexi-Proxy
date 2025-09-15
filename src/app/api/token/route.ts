import { redis } from "@/lib/redis";
import { PayloadRequest, withAuth } from "@/lib/with-auth";
import { NextResponse } from "next/server";

// GET
// API: '/api/token'
// Headers: Authorization Bearer Token(tk)
async function protectedGET(req: PayloadRequest) {
    // Get Token data
    if (!process.env.ADAPTER_PREFIX) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
    try {
        if (!req.payload || typeof req.payload["tk"] !== "string") {
            return NextResponse.json({ error: "Missing field" }, { status: 400 });
        }
        const tokenData: {
            uid: string;
            key: string;
            url: string;
            mid: string;
        } | null = await redis.get<{
            uid: string;
            key: string;
            url: string;
            mid: string;
        }>([process.env.ADAPTER_PREFIX, req.payload["tk"]].join(":"));
        if (tokenData !== null) {
            return NextResponse.json(tokenData, { status: 200 });
        } else {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Failed to get token data: ", error);
        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        );
    }
}

export const GET = withAuth(protectedGET);