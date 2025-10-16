import { auth } from "@/auth";
import * as jose from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);

export async function jwtSign(expiresIn?: number /*seconds*/): Promise<{
  token?: string;
  error?: string;
}> {
  if (
    process.env.JWT_SECRET_KEY === undefined ||
    process.env.JWT_ISSUER === undefined ||
    process.env.JWT_AUDIENCE === undefined
  ) {
    return { token: undefined, error: "Internal error" };
  }
  try {
    const jwtPayload: jose.JWTPayload = {
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE,
      jti: crypto.randomUUID(),
    };
    if (expiresIn !== undefined) {
      jwtPayload.exp = Math.floor(Date.now() / 1000) + expiresIn;
    }
    const jwt: string = await new jose.SignJWT(jwtPayload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(SECRET);
    return { token: jwt, error: undefined };
  } catch (err) {
    console.error("JWT signing error:", err);
    return { token: undefined, error: "Token signing failed" };
  }
}

export async function jwtVerify(token: string): Promise<{
  payload?: jose.JWTPayload;
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
    const { payload } = await jose.jwtVerify(token, SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    return { payload: payload, error: undefined };
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
