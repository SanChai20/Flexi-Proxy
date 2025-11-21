import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import { AuthRequest, withAuth } from "@/lib/with-auth";

export const preferredRegion = ["iad1", "cle1"];

// POST
// API: '/api/auth/deployment/progress'
// Headers: Authorization Bearer <Token>
// Body: {
//  [string] domain -> deployment subdomain name
//  [number] step -> current deployment step
//  [number] total_steps -> total deployment steps
//  [string] status -> success, error, running
//  [string] timestamp -> timestamp
//}
async function protectedPOST(req: AuthRequest) {
  if (process.env.DEPLOYMENT_PROGRESS_PREFIX === undefined) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
  try {
    const { domain, step, total_steps, status, message, timestamp } =
      await req.json();
    if (
      typeof domain !== "string" ||
      typeof step !== "number" ||
      typeof total_steps !== "number" ||
      typeof status !== "string" ||
      typeof timestamp !== "string"
    ) {
      return NextResponse.json({ error: "Missing field" }, { status: 400 });
    }
    const key = [process.env.DEPLOYMENT_PROGRESS_PREFIX, domain].join(":");
    const updated = {
      stp: step,
      tot: total_steps,
      sts: status,
      msg: message,
    };
    await redis.set(key, updated);
    return NextResponse.json({ message: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Failed to update progress: ", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export const POST = withAuth(protectedPOST);
