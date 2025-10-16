import { NextRequest } from "next/server";
import { jwtVerify } from "@/lib/jwt-edge";
import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface AuthRequest extends NextRequest {
  token?: string;
}
type Handler = (req: AuthRequest, context?: any) => Promise<Response>;

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

function getClientIdentifier(req: NextRequest, token?: string): string {
  if (token) return token;

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0];
  return ip || "unknown";
}

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

    // Rate Limiting
    const identifier = getClientIdentifier(req, token);
    const { success, limit, reset, remaining } = await rateLimiter.limit(
      identifier
    );
    if (!success) {
      return new Response(
        JSON.stringify({
          error: "Too many requests",
          limit,
          remaining: 0,
          reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    if (process.env.AUTHTOKEN_PREFIX === undefined) {
      return new Response(JSON.stringify({ error: "Internal Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const jwtToken: string | null = await redis.get<string>(
      [process.env.AUTHTOKEN_PREFIX, token].join(":")
    );
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
