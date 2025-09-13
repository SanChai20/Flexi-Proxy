import { redis } from "@/lib/database";
import { NextResponse } from "next/server";
import { PayloadRequest, withAuth } from "@/lib/with-auth";

// [INTERNAL] Get Security value and Delete Token Key
async function protectedGET(req: PayloadRequest) {
    try {
        if (!req.payload || typeof req.payload["token"] !== "string" || typeof req.payload["user_id"] !== "string") {
            return NextResponse.json({ error: "Missing field" }, { status: 400 });
        }
        const secureVal: string | null = await redis.getdel<string>([req.payload["user_id"], req.payload["token"]].join(":"));
        if (secureVal) {
            return NextResponse.json({ secure: secureVal });
        } else {
            return NextResponse.json(
                { error: "Not found" },
                { status: 404 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        );
    }
}

// [INTERNAL] Create Security value and Temp Token Key
async function protectedPOST(req: PayloadRequest) {
    try {
        if (!req.payload || typeof req.payload["secure"] !== "string" || typeof req.payload["user_id"] !== "string") {
            return NextResponse.json({ error: "Missing field" }, { status: 400 });
        }
        const token = crypto.randomUUID();
        await redis.set<string>([req.payload["user_id"], token].join(":"), req.payload["secure"], { ex: 300 });
        return NextResponse.json({ token });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Error" },
            { status: 500 }
        );
    }
}

export const GET = withAuth(protectedGET);
export const POST = withAuth(protectedPOST);