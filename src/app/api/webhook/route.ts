import { paddle } from "@/lib/paddle";
import { redis } from "@/lib/redis";
import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

// Email template for subscription cancellation/expiration notification
const createSubscriptionCancellationEmailTemplate = (userName?: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 48px 40px 32px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.5px;">
                                Subscription Update
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${
                              userName
                                ? `<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">Hello ${userName},</p>`
                                : ""
                            }
                            
                            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #333333;">
                                Your subscription has been cancelled or expired. As a result, your instance resources have been automatically released.
                            </p>
                            
                            <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #333333;">
                                We appreciate your time with us and would be delighted to welcome you back. Feel free to subscribe again whenever you're ready.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="https://flexiproxy.com/subscription" 
                                           style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; letter-spacing: 0.3px;">
                                            Resubscribe Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #fafafa; border-top: 1px solid #f0f0f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: #666666;">
                                Questions? We're here to help.
                            </p>
                            <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #999999;">
                                This is an automated notification from FlexiProxy. Please do not reply to this email.
                            </p>
                            ${
                              process.env.ADMIN_EMAIL
                                ? `
                            <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.5; color: #666666;">
                                Contact us: <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #667eea; text-decoration: none;">${process.env.ADMIN_EMAIL}</a>
                            </p>
                            `
                                : ""
                            }
                        </td>
                    </tr>
                </table>
                
                <!-- Email Footer -->
                <table role="presentation" style="max-width: 600px; width: 100%; margin-top: 24px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #999999;">
                                © ${new Date().getFullYear()} FlexiProxy. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

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
          try {
            await resend.emails.send({
              from: process.env.AUTH_RESEND_FROM as string,
              to: [userInfo.eml as string],
              subject: "Subscription Update - Resources Released",
              html: createSubscriptionCancellationEmailTemplate(),
              replyTo: process.env.ADMIN_EMAIL as string,
            });
            console.log(`[WEBHOOK] Cancellation email sent to ${userInfo.eml}`);
          } catch (emailError) {
            console.error(
              `[WEBHOOK] Failed to send cancellation email to ${userInfo.eml}:`,
              emailError
            );
          }
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
