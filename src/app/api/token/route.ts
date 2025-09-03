import { auth } from "@/auth";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {

    let session = await auth();
    if (!!(session && session.user && session.user.id)) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    await jwt.sign("", "")

    const { token } = await req.json();
    const secret = process.env.TURNSTILE_SECRET_KEY as string;
    const verifyResponseData = (await fetch(TURNSTILE_VERIFY_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    }).then((res) => res.json())) as TurnstileServerValidationResponse;

    if (!verifyResponseData.success) {
        return NextResponse.json(JSON.stringify(verifyResponseData), {
            status: 400,
            headers: responseHeaders,
        });
    }
    return NextResponse.json(JSON.stringify(verifyResponseData), {
        status: 200,
        headers: responseHeaders,
    });
}