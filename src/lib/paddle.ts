import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export const paddle = new Paddle((process.env.PADDLE_API_KEY as string) || "", {
  environment: (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ??
    "production") as Environment,
});
