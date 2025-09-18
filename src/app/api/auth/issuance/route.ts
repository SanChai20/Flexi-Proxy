import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { jwtSign } from "@/lib/jwt";

// POST
// API: '/api/auth/issuance'
// Headers: 'X-Proxy-Candidate'
export async function POST(req: NextRequest) {
    if (
        process.env.AUTHTOKEN_PREFIX === undefined ||
        process.env.ISSUE_PREFIX === undefined
    ) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
    try {
        const proxyCandidate: string | null = req.headers.get("X-Proxy-Candidate");
        if (proxyCandidate === null) {
            return NextResponse.json({ error: "Missing Field" }, { status: 400 });
        }
        const proxy: string | null = await redis.getdel<string>(
            [process.env.ISSUE_PREFIX, proxyCandidate].join(":")
        );
        if (proxy === null) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const { token: jwtToken, error } = await jwtSign();
        if (jwtToken === undefined) {
            return NextResponse.json({ error }, { status: 500 });
        }
        const token = crypto.randomUUID();
        await redis.set<string>(
            [process.env.AUTHTOKEN_PREFIX, token].join(":"),
            jwtToken,
            { ex: 3600 }
        );
        return NextResponse.json({ token, expiresIn: 3600 }, { status: 200 });
    } catch (error) {
        console.error("Failed to get token: ", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
