"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import {
  updateUserPermissions,
  checkUserLoggedIn,
  cancelSubscription,
  updateSubscription,
} from "@/lib/actions";
import { useRouter, usePathname } from "next/navigation";

interface SubscriptionClientProps {
  dict: any;
  permissions: {
    maa: number;
    mppa: number;
    adv: boolean;
  };
  price: {
    id: string;
    amount: string;
    currency: string;
  };
  subscription: {} | null;
}

const MIN_INSTANCES = 1;
const MAX_INSTANCES = 10;

export default function SubscriptionClient({
  dict,
  permissions,
  price,
}: SubscriptionClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [instanceCount, setInstanceCount] = useState(
    Math.min(
      MAX_INSTANCES,
      Math.max(MIN_INSTANCES, permissions.adv ? permissions.mppa : 1)
    )
  );
  const isPro = permissions.adv;

  const handleSubscribe = async () => {
    console.log("handleSubscribe called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
      // Redirect to checkout with selected quantity
      router.push(
        `/subscription/checkout?priceId=${encodeURIComponent(
          price.id
        )}&quantity=${encodeURIComponent(instanceCount.toString())}`
      );
    } catch (error) {
      console.error("Subscription error:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    console.log("handleUpdateSubscription called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
      await updateSubscription(instanceCount);
      router.refresh();
    } catch (error) {
      console.error("Update subscription error:", error);
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    console.log("handleCancelSubscription called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
      await cancelSubscription();
      router.refresh();
    } catch (error) {
      console.error("Cancel subscription error:", error);
      setIsLoading(false);
    }
  };

  const handleReactiveSubscription = async () => {
    console.log("handleReactiveSubscription called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
    } catch (error) {
      console.error("Reactive subscription error:", error);
      setIsLoading(false);
    }
  };

  const handleIncrement = () => {
    setInstanceCount((prev) => Math.min(MAX_INSTANCES, prev + 1));
  };

  const handleDecrement = () => {
    setInstanceCount((prev) => Math.max(MIN_INSTANCES, prev - 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Allow empty string for user to clear and retype
    if (value === "") {
      return;
    }

    // Parse the value and ensure it's a valid number
    const numValue = parseInt(value, 10);

    // Only update if it's a valid number and within range
    if (
      !isNaN(numValue) &&
      numValue >= MIN_INSTANCES &&
      numValue <= MAX_INSTANCES
    ) {
      setInstanceCount(numValue);
    } else if (!isNaN(numValue) && numValue > MAX_INSTANCES) {
      // If user tries to enter more than max, set to max
      setInstanceCount(MAX_INSTANCES);
    }
  };

  const handleInputBlur = () => {
    // Ensure we have a valid instance count when user leaves the input
    if (instanceCount < MIN_INSTANCES || isNaN(instanceCount)) {
      setInstanceCount(MIN_INSTANCES);
    } else if (instanceCount > MAX_INSTANCES) {
      setInstanceCount(MAX_INSTANCES);
    }
  };

  const totalPrice = parseInt(price.amount) * instanceCount * 0.01;
  const hasQuantityChanged = isPro && instanceCount !== permissions.mppa;

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
      price: price.amount !== undefined ? parseInt(price.amount) * 0.01 : 19,
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.isCurrent && (
                  <Badge variant="secondary" className="shrink-0">
                    {dict?.subscription?.currentPlan || "Current"}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="mb-8">
              <div className="flex items-end gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-semibold">
                    {price.currency}
                  </span>
                  <span className="text-6xl font-bold leading-none">
                    {plan.id === "pro" ? totalPrice.toFixed(2) : plan.price}
                  </span>
                </div>
                <span className="text-muted-foreground pb-2">
                  {plan.period}
                </span>
              </div>
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

            {/* Instance Counter */}
            {plan.id === "pro" && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">
                  {dict?.subscription?.instanceCount || "Number of Instances"}
                  <span className="text-muted-foreground ml-2">
                    ({MIN_INSTANCES}-{MAX_INSTANCES})
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={instanceCount <= MIN_INSTANCES || isLoading}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min={MIN_INSTANCES}
                      max={MAX_INSTANCES}
                      value={instanceCount}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      disabled={isLoading}
                      className="text-center text-2xl font-semibold h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={instanceCount >= MAX_INSTANCES || isLoading}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {instanceCount >= MAX_INSTANCES && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {dict?.subscription?.maxInstancesReached ||
                      "Maximum number of instances reached"}
                  </p>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            {plan.id === "pro" && (
              <div className="space-y-2">
                {isPro ? (
                  <>
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
