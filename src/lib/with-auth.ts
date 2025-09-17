import { NextRequest } from "next/server";
import { jwtVerify } from "@/lib/jwt";
import { redis } from "./redis";

export interface AuthRequest extends NextRequest {
  token?: string;
}
type Handler = (req: AuthRequest, context?: any) => Promise<Response>;

export function withAuth(handler: Handler): Handler {
  return async (req: AuthRequest, context) => {
    const authHeader = req.headers.get("authorization");
    if (authHeader === null || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = authHeader.split(" ")[1];
    if (process.env.AUTHTOKEN_PREFIX === undefined) {
      return new Response(JSON.stringify({ error: "Internal Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const jwtToken: string | null = await redis.get<string>([process.env.AUTHTOKEN_PREFIX, token].join(":"));
    if (jwtToken === null) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { payload, error } = await jwtVerify(jwtToken);
    if (payload === undefined) {
      return new Response(JSON.stringify({ error: error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    req.token = token;
    // If authenticated, call the original handler
    return handler(req, context);
  };
}
