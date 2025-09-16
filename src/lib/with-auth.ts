import { NextRequest } from "next/server";
import { jwtVerify } from "@/lib/jwt";

export interface PayloadRequest extends NextRequest {
  payload?: Record<string, any>;
}

type Handler = (req: PayloadRequest, context?: any) => Promise<Response>;

export function withAuth(handler: Handler): Handler {
  return async (req: PayloadRequest, context) => {
    const authHeader = req.headers.get("authorization");
    if (authHeader === null || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = authHeader.split(" ")[1];
    const { payload, error } = await jwtVerify(token);
    if (payload === undefined) {
      return new Response(JSON.stringify({ error: error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    req.payload = payload;
    // If authenticated, call the original handler
    return handler(req, context);
  };
}
