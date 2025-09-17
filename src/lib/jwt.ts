"use server";

import { auth } from "@/auth";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export async function jwtSign(
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
  try {
    // Create JWT payload with user information
    const jwtPayload: JwtPayload = {
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE,
      jti: crypto.randomUUID()
    };
    if (expiresIn !== undefined) {
      jwtPayload.exp = Math.floor(Date.now() / 1000) + expiresIn;
    }
    const token: string = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET_KEY
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
