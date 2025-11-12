"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Check,
  Loader2,
  Minus,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { useState } from "react";
import {
  checkUserLoggedIn,
  cancelSubscription,
  updateSubscription,
  reactivateSubscription,
} from "@/lib/actions";
import { useRouter } from "next/navigation";

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
  subscription: {
    isActive: boolean;
    isCanceled: boolean;
    status: string;
    nextBilledAt: string | null;
    canceledAt: string | null;
    currentQuantity: number;
    scheduledChange: any;
  } | null;
}

const MIN_INSTANCES = 1;
const MAX_INSTANCES = 10;

export default function SubscriptionClient({
  dict,
  permissions,
  price,
  subscription,
}: SubscriptionClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 初始化实例数量
  const initialQuantity =
    subscription?.currentQuantity || permissions.mppa || 1;
  const [instanceCount, setInstanceCount] = useState(
    Math.min(MAX_INSTANCES, Math.max(MIN_INSTANCES, initialQuantity))
  );

  const isPro = permissions.adv;
  const hasSubscription = subscription !== null;
  const isSubscriptionActive = subscription?.isActive || false;
  const isSubscriptionCanceled = subscription?.isCanceled || false;

  const handleSubscribe = async () => {
    console.log("handleSubscribe called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
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
      const success = await updateSubscription(instanceCount);
      if (success) {
        router.refresh();
      }
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
      const success = await cancelSubscription();
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Cancel subscription error:", error);
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    console.log("handleReactivateSubscription called");
    setIsLoading(true);
    try {
      const isLoggedIn = await checkUserLoggedIn();
      if (!isLoggedIn) {
        router.push("/verification");
        return;
      }
      const success = await reactivateSubscription();
      if (success) {
        router.refresh();
      }
    } catch (error) {
      console.error("Reactivate subscription error:", error);
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
    if (value === "") return;

    const numValue = parseInt(value, 10);
    if (
      !isNaN(numValue) &&
      numValue >= MIN_INSTANCES &&
      numValue <= MAX_INSTANCES
    ) {
      setInstanceCount(numValue);
    } else if (!isNaN(numValue) && numValue > MAX_INSTANCES) {
      setInstanceCount(MAX_INSTANCES);
    }
  };

  const handleInputBlur = () => {
    if (instanceCount < MIN_INSTANCES || isNaN(instanceCount)) {
      setInstanceCount(MIN_INSTANCES);
    } else if (instanceCount > MAX_INSTANCES) {
      setInstanceCount(MAX_INSTANCES);
    }
  };

  // 计算价格
  const totalPrice = parseInt(price.amount) * instanceCount * 0.01;

  // 判断数量是否改变
  const hasQuantityChanged = isPro && instanceCount !== initialQuantity;

  // 格式化日期
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        "Up to 10 access tokens",
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
        "Enhanced security features",
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

      {/* Subscription Status Alert */}
      {hasSubscription && isSubscriptionActive && (
        <div className="mb-6">
          <Card
            className={`p-4 ${
              isSubscriptionCanceled
                ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                : "border-green-500 bg-green-50 dark:bg-green-950"
            }`}
          >
            <div className="flex items-start gap-3">
              {isSubscriptionCanceled ? (
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              )}
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    isSubscriptionCanceled
                      ? "text-yellow-900 dark:text-yellow-100"
                      : "text-green-900 dark:text-green-100"
                  }`}
                >
                  {isSubscriptionCanceled
                    ? dict?.subscription?.status?.pendingCancellation ||
                      "待取消"
                    : dict?.subscription?.status?.active || "订阅有效"}
                </h3>
                <p
                  className={`text-sm ${
                    isSubscriptionCanceled
                      ? "text-yellow-800 dark:text-yellow-200"
                      : "text-green-800 dark:text-green-200"
                  }`}
                >
                  {isSubscriptionCanceled ? (
                    <>
                      {dict?.subscription?.status?.willExpireOn ||
                        "您的订阅将于"}{" "}
                      <strong>{formatDate(subscription.nextBilledAt)}</strong>{" "}
                      {dict?.subscription?.status?.expire || "到期"}。
                      {dict?.subscription?.status?.canStillUse ||
                        "在此之前您仍可使用所有Pro功能。"}
                    </>
                  ) : (
                    <>
                      {dict?.subscription?.status?.currentQuantity ||
                        "当前订阅"}{" "}
                      <strong>{subscription.currentQuantity}</strong>{" "}
                      {dict?.subscription?.status?.instances || "个实例"}。
                      {dict?.subscription?.status?.nextBillingDate ||
                        "下次计费日期："}{" "}
                      <strong>{formatDate(subscription.nextBilledAt)}</strong>
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

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

            {/* Instance Counter - Only show for Pro plan */}
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
                    {/* 如果订阅已取消，显示重新激活按钮 */}
                    {isSubscriptionCanceled ? (
                      <Button
                        type="button"
                        className="w-full"
                        variant="default"
                        disabled={isLoading}
                        onClick={handleReactivateSubscription}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {dict?.subscription?.processing || "Processing..."}
                          </>
                        ) : (
                          dict?.subscription?.pro?.buttonReactivate ||
                          "重新激活订阅"
                        )}
                      </Button>
                    ) : (
                      <>
                        {/* 如果数量改变，显示更新按钮 */}
                        {hasQuantityChanged && (
                          <Button
                            type="button"
                            className="w-full"
                            variant="default"
                            disabled={isLoading}
                            onClick={handleUpdateSubscription}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {dict?.subscription?.processing ||
                                  "Processing..."}
                              </>
                            ) : (
                              dict?.subscription?.pro?.buttonUpdate ||
                              "更新订阅（下周期生效）"
                            )}
                          </Button>
                        )}
                        {/* 取消订阅按钮 */}
                        <Button
                          type="button"
                          className="w-full"
                          variant="outline"
                          disabled={isLoading}
                          onClick={handleCancelSubscription}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {dict?.subscription?.processing ||
                                "Processing..."}
                            </>
                          ) : (
                            dict?.subscription?.pro?.buttonCancel || "取消订阅"
                          )}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  /* 如果没有订阅或订阅已过期，显示订阅按钮 */
                  <Button
                    type="button"
                    className="w-full"
                    variant="default"
                    disabled={isLoading}
                    onClick={handleSubscribe}
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

      {/* Refund Policy Notice */}
      <div className="mt-8">
        <Card className="p-4 bg-muted/50 border-muted">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">
                  {dict?.subscription?.refundPolicy?.title ||
                    "14-Day Refund Policy"}
                  :
                </strong>{" "}
                {dict?.subscription?.refundPolicy?.description ||
                  "We offer prorated refunds within 14 days of purchase or renewal. Contact us to request a refund."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
