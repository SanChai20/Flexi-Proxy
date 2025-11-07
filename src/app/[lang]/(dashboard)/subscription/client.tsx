"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { updateUserPermissions } from "@/lib/actions";
import { useRouter } from "next/navigation";

interface SubscriptionClientProps {
  dict: any;
  permissions: {
    maa: number;
    mppa: number;
    adv: boolean;
  };
}

export default function SubscriptionClient({
  dict,
  permissions,
}: SubscriptionClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const isPro = permissions.adv;

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // const success = await updateUserPermissions({
      //   adv: true,
      //   maa: 3,
      //   mppa: 1,
      // });
      // if (success) {
      //   router.refresh();
      // }
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      // const success = await updateUserPermissions({
      //   adv: false,
      //   maa: 3,
      //   mppa: 1,
      // });
      // if (success) {
      //   router.refresh();
      // }
    } catch (error) {
      console.error("Cancel subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: dict?.subscription?.free?.name || "Free",
      price: dict?.subscription?.free?.price || "$0",
      period: dict?.subscription?.free?.period || "/month",
      description:
        dict?.subscription?.free?.description ||
        "Perfect for individuals and small projects",
      features: dict?.subscription?.free?.features || [
        "Up to 3 access tokens",
        "Cannot create private gateways",
        "Basic support",
        "Community access",
      ],
      isCurrent: !isPro,
    },
    {
      id: "pro",
      name: dict?.subscription?.pro?.name || "Pro",
      price: dict?.subscription?.pro?.price || "$19",
      period: dict?.subscription?.pro?.period || "/month",
      description:
        dict?.subscription?.pro?.description ||
        "For professional developers and teams",
      features: dict?.subscription?.pro?.features || [
        "Up to 10 access tokens",
        "Private gateways (based on subscribed counts)",
        "Priority support",
        "Custom configurations",
      ],
      buttonText: isPro
        ? dict?.subscription?.pro?.buttonCancel || "Cancel Subscription"
        : dict?.subscription?.pro?.button || "Subscribe to Pro",
      isCurrent: isPro,
      action: isPro ? handleCancelSubscription : handleSubscribe,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-semibold mb-2">
          {dict?.subscription?.title || "Pricing"}
        </h1>
        <p className="text-muted-foreground">
          {dict?.subscription?.subtitle || "Choose the plan that works for you"}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`p-6 ${
              plan.isCurrent ? "border-primary" : "border-border"
            }`}
          >
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              {plan.isCurrent && (
                <Badge variant="secondary" className="shrink-0">
                  {dict?.subscription?.currentPlan || "Current"}
                </Badge>
              )}
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <span className="text-4xl font-semibold">{plan.price}</span>
              <span className="text-muted-foreground ml-1">{plan.period}</span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            {plan.id === "pro" && (
              <Button
                className="w-full"
                variant={plan.isCurrent ? "outline" : "default"}
                disabled={isLoading}
                onClick={plan.action}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  plan.buttonText
                )}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Footer */}
      {/* <p className="text-sm text-muted-foreground text-center mt-8">
        {dict?.subscription?.footer ||
          "All plans include a 14-day money-back guarantee"}
      </p> */}
    </div>
  );
}
