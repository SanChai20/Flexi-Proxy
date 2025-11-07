"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Minus, Plus } from "lucide-react";
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
  product: {
    price: number;
    currency: string;
  };
}

export default function SubscriptionClient({
  dict,
  permissions,
  product,
}: SubscriptionClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [instanceCount, setInstanceCount] = useState(
    permissions.adv ? permissions.mppa : 1
  );
  const isPro = permissions.adv;

  const handleSubscribe = async () => {
    console.log("handleSubscribe called"); // 添加调试日志
    setIsLoading(true);
    try {
      // console.log("Subscribing with", instanceCount, "instances");
      // const success = await updateUserPermissions({
      //   adv: true,
      //   maa: 3,
      //   mppa: instanceCount,
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

  const handleUpdateSubscription = async () => {
    console.log("handleUpdateSubscription called"); // 添加调试日志
    setIsLoading(true);
    try {
      // console.log("Updating subscription to", instanceCount, "instances");
      // const success = await updateUserPermissions({
      //   adv: true,
      //   maa: 3,
      //   mppa: instanceCount,
      // });
      // if (success) {
      //   router.refresh();
      // }
    } catch (error) {
      console.error("Update subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    console.log("handleCancelSubscription called"); // 添加调试日志
    setIsLoading(true);
    try {
      // console.log("Canceling subscription");
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

  const handleIncrement = () => {
    setInstanceCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setInstanceCount((prev) => Math.max(1, prev - 1));
  };

  const totalPrice = product.price * instanceCount * 0.01;
  const hasQuantityChanged = isPro && instanceCount !== permissions.mppa;

  // 添加调试信息
  // console.log("Component state:", {
  //   isPro,
  //   instanceCount,
  //   permissionsMppa: permissions.mppa,
  //   hasQuantityChanged,
  //   isLoading,
  // });

  const plans = [
    {
      id: "free",
      name: dict?.subscription?.free?.name || "Free",
      price: 0,
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
      price: product.price !== undefined ? product.price * 0.01 : 19,
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
      isCurrent: isPro,
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
            <div className="mb-8">
              <div className="flex items-end gap-1">
                <div className="flex items-start">
                  <span className="text-xl font-semibold mt-1.5">
                    {product.currency}
                  </span>
                  <span className="text-6xl font-bold leading-none ml-1">
                    {plan.id === "pro" ? totalPrice.toFixed(2) : plan.price}
                  </span>
                </div>
                <span className="text-muted-foreground pb-1.5 ml-1">
                  {plan.period}
                </span>
              </div>
              {plan.id === "pro" && (
                <p className="text-sm text-muted-foreground mt-2">
                  × {instanceCount}{" "}
                  {dict?.subscription?.instances || "instances"}
                </p>
              )}
            </div>

            {/* Instance Counter */}
            {plan.id === "pro" && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  {dict?.subscription?.instanceCount || "Number of Instances"}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={instanceCount <= 1 || isLoading}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-semibold">
                      {instanceCount}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={isLoading}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            {plan.id === "pro" && (
              <div className="space-y-2">
                {isPro ? (
                  <>
                    {/* Update button */}
                    {hasQuantityChanged && (
                      <Button
                        type="button"
                        className="w-full"
                        variant="default"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleUpdateSubscription();
                        }}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {dict?.subscription?.processing || "Processing..."}
                          </>
                        ) : (
                          dict?.subscription?.pro?.buttonUpdate ||
                          "Update Subscription"
                        )}
                      </Button>
                    )}
                    {/* Cancel button */}
                    <Button
                      type="button"
                      className="w-full"
                      variant="outline"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancelSubscription();
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {dict?.subscription?.processing || "Processing..."}
                        </>
                      ) : (
                        dict?.subscription?.pro?.buttonCancel ||
                        "Cancel Subscription"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    variant="default"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSubscribe();
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {dict?.subscription?.processing || "Processing..."}
                      </>
                    ) : (
                      dict?.subscription?.pro?.button || "Subscribe to Pro"
                    )}
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
