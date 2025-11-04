"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2 } from "lucide-react";
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
      const success = await updateUserPermissions({
        adv: false,
        maa: 3,
        mppa: 1,
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
    <div className="min-h-screen w-full py-20 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 mb-4">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {dict?.subscription?.badge || "Pricing Plans"}
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-white dark:to-slate-100 bg-clip-text text-transparent">
          {dict?.subscription?.title || "Simple, Transparent Pricing"}
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {dict?.subscription?.subtitle ||
            "Choose the perfect plan for your needs. Upgrade or downgrade at any time."}
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              plan.isPopular
                ? "border-2 border-blue-500 dark:border-blue-400 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900"
                : "border border-slate-200 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900"
            }`}
          >
            {/* Decorative gradient overlay for Pro plan */}
            {plan.isPopular && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
            )}

            {/* Current Plan Badge */}
            {plan.isCurrent && (
              <Badge className="absolute top-6 right-6 bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow-lg">
                <Check className="w-3 h-3 mr-1" />
                {dict?.subscription?.currentPlan || "Current Plan"}
              </Badge>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {plan.period}
                  </span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.showButton && (
                <Button
                  className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                    plan.isPopular
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                  }`}
                  disabled={isLoading}
                  onClick={plan.action}
                >
                  {isLoading && plan.id === "pro" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              )}

              {!plan.showButton && (
                <div className="w-full h-12 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-500 text-sm font-medium">
                  {dict?.subscription?.yourPlan || "Your Current Plan"}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="max-w-5xl mx-auto mt-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-500">
          {dict?.subscription?.footer ||
            "All plans include a 14-day money-back guarantee. No questions asked."}
        </p>
      </div>
    </div>
  );
}
