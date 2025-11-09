"use client";

import {
  CheckoutEventsData,
  CheckoutEventsTimePeriodInterval,
  type Environments,
  initializePaddle,
  type Paddle,
} from "@paddle/paddle-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import throttle from "lodash.throttle";
import { BackIcon } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, CreditCard, Info } from "lucide-react";

interface CheckoutClientProps {
  dict: any;
  quantity: number;
  priceId: string;
  userId: string;
}

interface CheckoutEventsTimePeriod {
  frequency: number;
  interval: CheckoutEventsTimePeriodInterval;
}

type CurrencyCode = string;

const BillingCycleMap = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  year: "yearly",
};

const CustomBillingCycleMap = {
  day: "days",
  week: "weeks",
  month: "months",
  year: "years",
};

function format_money(amount: number = 0, currency: string = "USD"): string {
  const language =
    typeof navigator !== "undefined" ? navigator.language : "en-US";
  return new Intl.NumberFormat(language ?? "en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function format_billing_cycle({
  frequency,
  interval,
}: CheckoutEventsTimePeriod): string {
  if (frequency === 1) {
    return BillingCycleMap[interval];
  } else {
    return ["every", frequency, CustomBillingCycleMap[interval]].join(" ");
  }
}

function SummaryContent({
  value,
  currencyCode,
}: {
  value: number | undefined;
  currencyCode: string | undefined;
}) {
  if (value !== undefined) {
    return (
      <span className="text-lg font-semibold text-foreground">
        {format_money(value, currencyCode)}
      </span>
    );
  }
  return <Skeleton className="h-6 w-20 bg-muted" />;
}

function OrderSummary({
  quantity,
  checkoutData,
}: {
  quantity: number;
  checkoutData?: CheckoutEventsData | null;
}) {
  const [billingCycle, setBillingCycle] = useState<
    CheckoutEventsTimePeriod | undefined
  >(undefined);
  const [recurringTotal, setRecurringTotal] = useState<number | undefined>(
    undefined
  );
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode | undefined>(
    undefined
  );
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [subtotal, setSubtotal] = useState<number | undefined>(undefined);
  const [tax, setTax] = useState<number | undefined>(undefined);
  const [priceName, setPriceName] = useState<string | null | undefined>(null);

  useEffect(() => {
    if (checkoutData) {
      setBillingCycle(
        checkoutData.items.find((item) => item.billing_cycle)?.billing_cycle
      );
      setRecurringTotal(checkoutData.recurring_totals?.total);
      setCurrencyCode(checkoutData.currency_code);
      setTotal(checkoutData.totals.total);
      setSubtotal(checkoutData.totals.subtotal);
      setTax(checkoutData.totals.tax);
      setPriceName(checkoutData.items[0].price_name);
    }
  }, [checkoutData]);

  return (
    <div className="space-y-6">
      {/* Total Price Display */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 p-6 shadow-lg backdrop-blur-sm">
        {total !== undefined ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              <span>Total Price</span>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {format_money(total, currencyCode)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 bg-muted" />
            <Skeleton className="h-10 w-48 bg-muted" />
          </div>
        )}
      </div>

      {/* Recurring Payment Info */}
      {recurringTotal !== undefined && billingCycle !== undefined && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
          <Info className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">
            then{" "}
            <span className="font-semibold text-foreground">
              {format_money(recurringTotal, currencyCode)}
            </span>{" "}
            {format_billing_cycle(billingCycle)}
          </span>
        </div>
      )}

      {/* Line Items */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        {/* Product Name */}
        {priceName && (
          <div className="pb-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">
              {priceName}
            </h3>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <SummaryContent value={subtotal} currencyCode={currencyCode} />
        </div>

        {/* Tax */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Tax</span>
          <SummaryContent value={tax} currencyCode={currencyCode} />
        </div>

        {/* Separator */}
        <div className="border-t border-border"></div>

        {/* Due Today */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-foreground">
            Due Today
          </span>
          <SummaryContent value={total} currencyCode={currencyCode} />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutClient({
  dict,
  quantity,
  priceId,
  userId,
}: CheckoutClientProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(
    null
  );
  const router = useRouter();

  const handleCheckoutEvents = (event: CheckoutEventsData) => {
    setCheckoutData(event);
  };

  const updateItems = useCallback(
    throttle((paddle: Paddle, priceId: string, quantity: number) => {
      paddle?.Checkout.updateItems([{ priceId, quantity }]);
    }, 800),
    []
  );

  useEffect(() => {
    if (
      !paddle?.Initialized &&
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        eventCallback: async (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data);
          }
        },
        checkout: {
          settings: {
            variant: "one-page",
            displayMode: "inline",
            theme: "dark",
            locale: "en",
            allowLogout: !userId,
            frameInitialHeight: 450,
            frameTarget: "checkout-frame",
            frameStyle:
              "width: 100%; background-color: transparent; border: none",
            successUrl: "/subscription/success",
          },
        },
      })
        .then(async (paddle) => {
          if (paddle && priceId) {
            setPaddle(paddle);
            paddle.Checkout.open({
              ...(userId && { customData: { userId } }),
              items: [{ priceId: priceId, quantity: quantity }],
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [paddle?.Initialized, priceId, userId]);

  useEffect(() => {
    if (paddle && priceId && paddle.Initialized) {
      updateItems(paddle, priceId, quantity);
    }
  }, [paddle, priceId, quantity, updateItems]);

  return (
    <div className="relative min-h-screen">
      {/* Main Container */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Grid Layout */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Order Summary Section - Left Side */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Order Summary
                </h2>
              </div>

              {/* Summary Content */}
              <OrderSummary quantity={quantity} checkoutData={checkoutData} />
            </div>

            {/* Payment Section - Right Side */}
            <div className="space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Payment Details
                </h2>
              </div>

              {/* Payment Frame Container */}
              <div className="overflow-hidden rounded-xl border border-border bg-gradient-to-br from-card to-card/50 shadow-lg backdrop-blur-sm">
                <div className="checkout-frame min-h-[450px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
