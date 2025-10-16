import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "@/lib/jwt";
import { redis } from "./redis";
import { Ratelimit } from "@upstash/ratelimit";

export interface AuthRequest extends NextRequest {
  token: string;
  userId?: string;
}

type AuthHandler<TParams = any> = (
  req: AuthRequest,
  context: { params: Promise<TParams> }
) => Promise<Response>;

interface JWTPayload {
  userId?: string;
  [key: string]: any;
}

const ENV = {
  AUTHTOKEN_PREFIX: process.env.AUTHTOKEN_PREFIX!,
} as const;
const RedisKeys = {
  authToken: (token: string) => `${ENV.AUTHTOKEN_PREFIX}:${token}`,
} as const;

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(80, "1 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

function createErrorResponse(message: string, status: number): Response {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // "Bearer ".length === 7
}

function getClientIdentifier(req: NextRequest, token?: string): string {
  if (token) return token;

  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0];
  return ip || "unknown";
}

export function withAuth<TParams = any>(
  handler: AuthHandler<TParams>
): (
  request: NextRequest,
  context: { params: Promise<TParams> }
) => Promise<Response> {
  return async (req: NextRequest, context: { params: Promise<TParams> }) => {
    try {
      const authHeader = req.headers.get("authorization");
      const token = extractBearerToken(authHeader);
      if (!token) {
        return createErrorResponse(
          "Unauthorized: Missing or invalid token",
          401
        );
      }

      // Rate Limiting
      const identifier = getClientIdentifier(req, token);
      const { success, limit, reset, remaining } = await rateLimiter.limit(
        identifier
      );
      if (!success) {
        return NextResponse.json(
          {
            error: "Too many requests",
            limit,
            remaining: 0,
            reset,
          },
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

      // JWT token
      const jwtToken = await redis.get<string>(RedisKeys.authToken(token));
      if (!jwtToken) {
        return createErrorResponse("Unauthorized: Invalid token", 401);
      }

      // Verify JWT
      const { payload, error } = await jwtVerify(jwtToken);
      if (!payload) {
        console.error("JWT verification failed:", error);
        return createErrorResponse(
          error || "Unauthorized: Token verification failed",
          401
        );
      }
      const authReq = Object.assign(req, {
        token,
        userId: (payload as JWTPayload).userId,
      }) as AuthRequest;

      return handler(authReq, context);
    } catch (error) {
      console.error("Auth middleware error:", error);
      return createErrorResponse("Internal Server Error", 500);
    }
  };
}
