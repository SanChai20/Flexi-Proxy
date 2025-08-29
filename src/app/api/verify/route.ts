import type { TurnstileServerValidationResponse } from "@marsidev/react-turnstile";
import { NextResponse } from "next/server";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const responseHeaders = {
  "content-type": "application/json",
};

export async function POST(req: Request) {
  const { token } = await req.json();
  const secret = process.env.TURNSTILE_SECRET_KEY as string;
  const verifyResponseData = (await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(
      token
    )}`,
  }).then((res) => res.json())) as TurnstileServerValidationResponse;
  //console.log(`verifyResponseData - ${JSON.stringify(verifyResponseData)}`);
  if (!verifyResponseData.success) {
    return NextResponse.json(JSON.stringify(verifyResponseData), {
      status: 400,
      headers: responseHeaders,
    });
  }
  return NextResponse.json(JSON.stringify(verifyResponseData), {
    status: 200,
    headers: responseHeaders,
  });
}
