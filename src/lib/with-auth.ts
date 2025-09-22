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
    console.warn("Auth 1.")
    if (authHeader === null || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = authHeader.split(" ")[1];
    console.warn("Auth 2.")
    if (process.env.AUTHTOKEN_PREFIX === undefined) {
      return new Response(JSON.stringify({ error: "Internal Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.warn("Auth 3.")
    const jwtToken: string | null = await redis.get<string>([process.env.AUTHTOKEN_PREFIX, token].join(":"));
    if (jwtToken === null) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.warn("Auth 4.")
    const { payload, error } = await jwtVerify(jwtToken);
    if (payload === undefined) {
      return new Response(JSON.stringify({ error: error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.warn("Auth 5.")
    req.token = token;
    // If authenticated, call the original handler
    return handler(req, context);
  };
}
