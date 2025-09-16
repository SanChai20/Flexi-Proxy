"use server";

import { auth } from "@/auth";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export async function jwtSign(
  uidOnly: boolean,
  expiresIn?: number //seconds
): Promise<{
  token?: string;
  error?: string;
}> {
  // Validate environment variables
  if (
    process.env.JWT_SECRET_KEY === undefined ||
    process.env.JWT_ISSUER === undefined ||
    process.env.JWT_AUDIENCE === undefined
  ) {
    return { token: undefined, error: "Internal error" };
  }

  const session = await auth();
  if (!(session && session.user && session.user.id)) {
    return { token: undefined, error: "Unauthorized" };
  }

  let authPayload: Record<string, string> = {
    uid: session.user.id,
  };

  if (!uidOnly) {
    authPayload["ue"] = session.user.email || "unknown";
    authPayload["un"] = session.user.name || "unknown";
  }

  try {
    // Create JWT payload with user information
    const jwtPayload = {
      ...authPayload,
      jti: crypto.randomUUID(),
    };

    // Sign the token
    const signOptions: jwt.SignOptions = {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    };

    // Only add expiresIn if it's defined
    if (expiresIn !== undefined) {
      signOptions.expiresIn = expiresIn;
    }

    const token: string = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET_KEY,
      signOptions
    );

    return { token };
  } catch (error) {
    console.error("JWT signing error:", error);
    return { token: undefined, error: "Token signing failed" };
  }
}

export async function jwtVerify(token: string): Promise<{
  payload?: JwtPayload;
  error?: string;
}> {
  // Validate environment variables
  if (
    process.env.JWT_SECRET_KEY === undefined ||
    process.env.JWT_ISSUER === undefined ||
    process.env.JWT_AUDIENCE === undefined
  ) {
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
