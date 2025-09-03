import { auth } from "@/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    let session = await auth();
    if (!(session && session.user && session.user.id)) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
    const token: string = jwt.sign({ user_id: session.user.id }, process.env.JWT_SECRET_KEY as string, { expiresIn: "5s" })
    return NextResponse.json({ token })
}