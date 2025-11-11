import { paddle } from "@/lib/paddle";
import { redis } from "@/lib/redis";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const signature = (req.headers.get("paddle-signature") as string) || null;
    if (signature === null) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    const secretKey = process.env.PADDLE_WEBHOOK_SECRET || "";
    const payload = await req.json();
    const eventData = await paddle.webhooks.unmarshal(
      JSON.stringify(payload),
      secretKey,
      signature
    );

    switch (eventData.eventType) {
      // 下一个订单周期取消，下一个订单周期开始才会触发这个Canceled事件
      case EventName.SubscriptionCanceled:
        const subscriptionId = eventData.data.id;
        const userId = await redis.get(
          [process.env.SUBSCRIPTION_KEY_PREFIX, subscriptionId].join(":")
        );
        let transaction = redis.multi();
        transaction.set([process.env.PERMISSIONS_PREFIX, userId].join(":"), {
          maa: 3, // max adapters allowed
          mppa: 0, // max private proxies allowed
          adv: "free", // free
        });
        transaction.del(
          [process.env.SUBSCRIPTION_KEY_PREFIX, subscriptionId].join(":")
        );
        transaction.del(
          [process.env.SUBSCRIPTION_KEY_PREFIX, userId].join(":")
        );
        // release instances

        await transaction.exec();
        break;
      case EventName.SubscriptionPastDue:
        // 主动修改User Subscription Plan，但是可以不同删除SubscriptionID

        //TODO...添加过期记录

        break;
      case EventName.TransactionCompleted:
        // Only support one item per transaction for now
        const customData = eventData.data.customData as
          | { userId: string }
          | undefined;
        const item = eventData?.data?.items?.[0];
        if (customData?.userId && item) {
          let transaction = redis.multi();
          transaction.set(
            [process.env.PERMISSIONS_PREFIX, customData.userId].join(":"),
            {
              maa: 10, // max adapters allowed
              mppa: item.quantity, // max private proxies allowed
              adv: "pro", // pro
            }
          );
          transaction.set(
            [process.env.SUBSCRIPTION_KEY_PREFIX, customData.userId].join(":"),
            eventData.data.subscriptionId
          );
          transaction.set(
            [
              process.env.SUBSCRIPTION_KEY_PREFIX,
              eventData.data.subscriptionId,
            ].join(":"),
            customData.userId
          );
          await transaction.exec();
        }
        break;
      default:
        console.log(eventData.eventType);
    }
    return NextResponse.json(
      { success: true, message: "Webhook received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
