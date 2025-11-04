"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
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
      // 订阅 Pro 计划
      // const success = await updateUserPermissions({
      //   adv: true,
      //   maa: 999999, // 无限令牌
      //   mppa: 999999, // 无限私有代理
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
      // 取消订阅，恢复为 Free 计划
      const success = await updateUserPermissions({
        adv: false,
        maa: 3, // 恢复免费版限制
        mppa: 1, // 恢复免费版限制
      });
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: dict?.subscription?.free?.name || "Free Plan",
      price: dict?.subscription?.free?.price || "$0",
      period: dict?.subscription?.free?.period || "/month",
      description:
        dict?.subscription?.free?.description ||
        "Perfect for individuals and small projects",
      features: dict?.subscription?.free?.features || [
        "Up to 3 access tokens",
        "Up to 1 private proxy",
        "Basic support",
        "Community access",
      ],
      isCurrent: !isPro,
      isPopular: false,
      showButton: false,
    },
    {
      id: "pro",
      name: dict?.subscription?.pro?.name || "Pro Plan",
      price: dict?.subscription?.pro?.price || "$15",
      period: dict?.subscription?.pro?.period || "/month",
      description:
        dict?.subscription?.pro?.description ||
        "For professional developers and teams",
      features: dict?.subscription?.pro?.features || [
        "Unlimited access tokens",
        "Unlimited private proxies",
        "Priority support",
        "Advanced features",
        "Custom configurations",
      ],
      buttonText: isPro
        ? dict?.subscription?.pro?.buttonCancel || "Cancel Subscription"
        : dict?.subscription?.pro?.button || "Subscribe to Pro",
      isCurrent: isPro,
      isPopular: true,
      showButton: true,
      action: isPro ? handleCancelSubscription : handleSubscribe,
    },
  ];

  return (
    <div className="w-full py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">
          {dict?.subscription?.title || "Subscription Plans"}
        </h1>
        <p className="text-muted-foreground">
          {dict?.subscription?.subtitle ||
            "Choose the plan that's right for you"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-8 transition-all duration-300 ${
              plan.isPopular
                ? "border-2 border-blue-500 shadow-xl hover:shadow-2xl "
                : "border border-gray-200 shadow-md hover:shadow-lg"
            }`}
          >
            {/* {plan.isPopular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                {dict?.subscription?.popular || "Popular"}
              </Badge>
            )} */}

            {plan.isCurrent && (
              <Badge className="absolute -top-3 right-8 bg-green-500">
                {dict?.subscription?.currentPlan || "Current Plan"}
              </Badge>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {plan.description}
              </p>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground ml-1">
                  {plan.period}
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {plan.showButton && (
              <Button
                className="w-full"
                variant="default"
                disabled={isLoading}
                onClick={plan.action}
              >
                {isLoading && plan.id === "pro" ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  plan.buttonText
                )}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
