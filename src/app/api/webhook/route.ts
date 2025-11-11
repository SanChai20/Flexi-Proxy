import { Paddle, EventName, Environment } from "@paddle/paddle-node-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    //     const signature = (req.headers.get("paddle-signature") as string) || null;
    //     if (signature === null) {
    //       return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    //     }
    //     const secretKey = process.env.PADDLE_WEBHOOK_SECRET || "";
    //     const payload = await req.json();
    //     const eventData = await paddle.webhooks.unmarshal(
    //       JSON.stringify(payload),
    //       secretKey,
    //       signature
    //     );

    //     switch (eventData.eventType) {
    //       // 下一个订单周期取消，下一个订单周期开始才会触发这个Canceled事件
    //       case EventName.SubscriptionCanceled:
    //         //TODO...添加取消记录

    //         //await remove_key([ USER_SUBSCRIPTION_PLAN_PREFIX,  ])

    //         // set_key_value<{ subscriptionPlan: SubscriptionPlan, subscriptionId: string }>([USER_SUBSCRIPTION_PLAN_PREFIX, customData.userId].join(':'), {
    //         //     subscriptionPlan: PlanPro,
    //         //     subscriptionId: eventData.data.subscriptionId
    //         // });

    //         break;
    //       case EventName.SubscriptionPastDue:
    //         // 主动修改User Subscription Plan，但是可以不同删除SubscriptionID

    //         //TODO...添加过期记录

    //         break;
    //       case EventName.TransactionCompleted:
    //         // Only support one item per transaction for now
    //         const customData = eventData.data.customData as
    //           | { userId: string }
    //           | undefined;
    //         if (customData?.userId) {
    //           if (eventData.data.subscriptionId !== null) {
    //             console.log("Enter subscription");
    //             // Reset the user's selections, in case they were change the subscription plan
    //             const transaction = DatabaseFactory.PrimaryKV.transaction();
    //             transaction.del(
    //               [USER_PROVIDER_MODEL_SELECTION_PREFIX, customData.userId].join(
    //                 ":"
    //               )
    //             );
    //             transaction.del(
    //               [USER_MCP_SERVICES_SELECTION_PREFIX, customData.userId].join(":")
    //             );
    //             //transaction.set();//TODO...添加订阅记录
    //             if (eventData.data.items.length > 0) {
    //               const item = eventData.data.items[0];
    //               if (
    //                 item.price?.id ===
    //                   process.env.NEXT_PUBLIC_PRICE_ID_ADVANCED_MONTH ||
    //                 item.price?.id ===
    //                   process.env.NEXT_PUBLIC_PRICE_ID_ADVANCED_YEAR
    //               ) {
    //                 transaction.set<{
    //                   subscriptionPlan: SubscriptionPlan;
    //                   subscriptionId: string;
    //                 }>(
    //                   [USER_SUBSCRIPTION_PLAN_PREFIX, customData.userId].join(":"),
    //                   {
    //                     subscriptionPlan: PlanAdvanced,
    //                     subscriptionId: eventData.data.subscriptionId,
    //                   }
    //                 );
    //               } else if (
    //                 item.price?.id === process.env.NEXT_PUBLIC_PRICE_ID_PRO_MONTH ||
    //                 item.price?.id === process.env.NEXT_PUBLIC_PRICE_ID_PRO_YEAR
    //               ) {
    //                 transaction.set<{
    //                   subscriptionPlan: SubscriptionPlan;
    //                   subscriptionId: string;
    //                 }>(
    //                   [USER_SUBSCRIPTION_PLAN_PREFIX, customData.userId].join(":"),
    //                   {
    //                     subscriptionPlan: PlanPro,
    //                     subscriptionId: eventData.data.subscriptionId,
    //                   }
    //                 );
    //               }
    //             }
    //             await transaction.exec();
    //           } else {
    //             console.log("Enter one-time payment");
    //             // Deal with one-time payment
    //             const lineItems = eventData.data.details?.lineItems;
    //             if (lineItems && lineItems.length > 0 && lineItems[0].totals) {
    //               const subtotal = parseInt(lineItems[0].totals.subtotal) / 100;
    //               const createdAtTimestamp = new Date(
    //                 eventData.data.createdAt
    //               ).getTime();
    //               // Credit topup & record history
    //               const transaction = DatabaseFactory.PrimaryKV.transaction();
    //               transaction.incrby(
    //                 [USER_CREDIT_BALANCE_PREFIX, customData.userId].join(":"),
    //                 subtotal
    //               );
    //               transaction.set<{
    //                 amount: number;
    //                 createdAt: number;
    //                 currencyCode: string;
    //               }>(
    //                 [
    //                   USER_CREDIT_TOPUP_HISTORY_PREFIX,
    //                   customData.userId,
    //                   eventData.data.id,
    //                 ].join(":"),
    //                 {
    //                   amount: subtotal,
    //                   createdAt: createdAtTimestamp,
    //                   currencyCode: eventData.data.currencyCode as string,
    //                 },
    //                 { ex: TTL_STRATEGIES.LONG_TERM }
    //               );
    //               await transaction.exec();
    //             }
    //           }
    //         }
    //         break;
    //       default:
    //         console.log(eventData.eventType);
    //     }
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
