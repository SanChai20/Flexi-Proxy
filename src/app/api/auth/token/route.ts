import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { jwtSign } from "@/lib/jwt";

// POST 
// API: '/api/auth/token'
// Headers: 'X-Proxy-Issue'
// Get the initial token
export async function POST(
    req: NextRequest
) {
    if (process.env.AUTHTOKEN_PREFIX === undefined || process.env.ISSUE_PREFIX === undefined) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
    try {
        const proxyIssue: string | null = req.headers.get("X-Proxy-Issue");
        if (proxyIssue === null) {
            return NextResponse.json({ error: "Missing Field" }, { status: 400 });
        }
        const proxy: string | null = await redis.getdel<string>([process.env.ISSUE_PREFIX, proxyIssue].join(":"));
        if (proxy === null) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { token: jwtToken, error } = await jwtSign();
        if (jwtToken === undefined) {
            return NextResponse.json({ error }, { status: 500 });
        }
        const token = crypto.randomUUID();
        await redis.set<string>([process.env.AUTHTOKEN_PREFIX, token].join(":"), jwtToken, { ex: 7200 });
        return NextResponse.json({ token, expiresIn: 7200 }, { status: 200 });
    } catch (error) {
        console.error("Failed to get token: ", error);
        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        );
    }
}