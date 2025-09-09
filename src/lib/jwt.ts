"use server";

import { auth } from "@/auth";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export async function jwtSign(
  payload?: Record<string, any>,
  expiresIn?: number //seconds
): Promise<{
  token?: string;
  error?: string;
}> {
  // Validate environment variables
  if (!process.env.JWT_SECRET_KEY) {
    return { token: undefined, error: "Internal error" };
  }

  if (!process.env.JWT_ISSUER) {
    return { token: undefined, error: "Internal error" };
  }

  if (!process.env.JWT_AUDIENCE) {
    return { token: undefined, error: "Internal error" };
  }

  // Get session
  // const session = await auth();
  // if (!(session && session.user && session.user.id)) {
  //   return { token: undefined, error: "Invalid session" };
  // }
  // TODO...
  const session = {
    user: {
      id: "ABC123",
      name: "",
      email: "sc20@613.com"
    }
  }

  try {
    // Create JWT payload with user information
    const jwtPayload = {
      ...(payload || {}),
      user_id: session.user.id,
      user_name: session.user.name || "Unknown",
      user_email: session.user.email || "",
      jti: crypto.randomUUID(),
    };

    // Sign the token
    const token: string = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {
      expiresIn,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    return { token };
  } catch (error: any) {
    console.error("JWT signing error:", error);
    return { token: undefined, error: "Token signing failed" };
  }
}

export async function jwtVerify(token: string): Promise<{
  payload?: JwtPayload;
  error?: string;
}> {
  // Validate environment variables
  if (!process.env.JWT_SECRET_KEY) {
    return { payload: undefined, error: "Internal error" };
  }

  if (!process.env.JWT_ISSUER) {
    return { payload: undefined, error: "Internal error" };
  }

  if (!process.env.JWT_AUDIENCE) {
    return { payload: undefined, error: "Internal error" };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }) as JwtPayload;

    return { payload: decoded };
  } catch (error: any) {
    console.error("JWT verification error:", error);
    if (error.name === "TokenExpiredError") {
      return { payload: undefined, error: "Token has expired" };
    } else if (error.name === "JsonWebTokenError") {
      return { payload: undefined, error: "Invalid token" };
    } else {
      return { payload: undefined, error: "Token verification failed" };
    }
  }
}
