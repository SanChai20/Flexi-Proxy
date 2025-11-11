import { paddle } from "@/lib/paddle";
import { redis } from "@/lib/redis";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.AUTH_RESEND_KEY);
export async function POST(req: NextRequest) {
  try {
    const signature = (req.headers.get("paddle-signature") as string) || null;
    if (!signature) {
      console.error("[WEBHOOK] Missing paddle-signature header");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const secretKey = process.env.PADDLE_WEBHOOK_SECRET;
    if (!secretKey) {
      console.error("[WEBHOOK] PADDLE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const payload = await req.json();

    let eventData;
    try {
      eventData = await paddle.webhooks.unmarshal(
        JSON.stringify(payload),
        secretKey,
        signature
      );
    } catch (error) {
      console.error("[WEBHOOK] Signature verification failed:", error);
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventId = eventData.eventId || payload.event_id;
    if (eventId) {
      const alreadyProcessed = await redis.get(
        [process.env.PROCESSING_EVENT_PREFIX, eventId].join(":")
      );
      if (alreadyProcessed !== null) {
        console.log(`[WEBHOOK] Event ${eventId} already processed, skipping`);
        return NextResponse.json(
          { success: true, message: "Event already processed" },
          { status: 200 }
        );
      }
      await redis.set(
        [process.env.PROCESSING_EVENT_PREFIX, eventId].join(":"),
        Date.now(),
        { ex: 86400 }
      ); // 24 hours expiration
    }
    console.log(`[WEBHOOK] Processing event: ${eventData.eventType}`, {
      eventId,
      timestamp: new Date().toISOString(),
    });

    switch (eventData.eventType) {
      // 下一个订单周期取消，下一个订单周期开始才会触发这个Canceled事件
      case EventName.SubscriptionCanceled:
      // 过期资源释放
      case EventName.SubscriptionPastDue:
        const subscriptionId = eventData.data.id;
        if (!subscriptionId) {
          console.error("[WEBHOOK] Missing subscription ID");
          break;
        }
        const userInfo = await redis.get<{ uid: string; eml: string }>(
          [process.env.SUBSCRIPTION_KEY_PREFIX, subscriptionId].join(":")
        );
        if (!userInfo) {
          console.error(
            `[WEBHOOK] No user found for subscription ID: ${subscriptionId}`
          );
          break;
        }
        // Email notification
        if (userInfo.eml && userInfo.eml.length > 0) {
          // await resend.emails.send({
          //   from: process.env.AUTH_RESEND_FROM as string,
          //   to: [userInfo.eml as string],
          //   subject: `🔔 New Contact Form Submit: ${subject}`,
          //   html: createEmailTemplate(contactData),
          //   replyTo: process.env.ADMIN_EMAIL as string,
          // });
        }

        let transaction = redis.multi();
        transaction.set(
          [process.env.PERMISSIONS_PREFIX, userInfo.uid].join(":"),
          {
            maa: 10, // max adapters allowed
            mppa: 0, // max private proxies allowed
            adv: false, // free
          }
        );
        transaction.del(
          [process.env.SUBSCRIPTION_KEY_PREFIX, subscriptionId].join(":")
        );
        transaction.del(
          [process.env.SUBSCRIPTION_KEY_PREFIX, userInfo.uid].join(":")
        );
        // release instances

        await transaction.exec();
        console.log(
          `[WEBHOOK] Subscription ${subscriptionId} canceled for user ${userInfo.uid}`
        );
        break;
      case EventName.TransactionCompleted:
        // Only support one item per transaction for now
        const customData = eventData.data.customData as
          | { userId: string; userEmail: string }
          | undefined;
        const item = eventData?.data?.items?.[0];
        if (customData?.userId && item) {
          let transaction = redis.multi();
          transaction.set(
            [process.env.PERMISSIONS_PREFIX, customData.userId].join(":"),
            {
              maa: 10, // max adapters allowed
              mppa: item.quantity, // max private proxies allowed
              adv: true, // pro
            }
          );
          transaction.set(
            [process.env.SUBSCRIPTION_KEY_PREFIX, customData.userId].join(":"),
            eventData.data.subscriptionId
          );
          transaction.set<{ uid: string; eml: string }>(
            [
              process.env.SUBSCRIPTION_KEY_PREFIX,
              eventData.data.subscriptionId,
            ].join(":"),
            { uid: customData.userId, eml: customData?.userEmail || "" }
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
