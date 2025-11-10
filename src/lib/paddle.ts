import { Paddle, Environment } from "@paddle/paddle-node-sdk";

export const paddle = new Paddle((process.env.PADDLE_API_KEY as string) || "", {
  environment: "sandbox" as Environment,
});
