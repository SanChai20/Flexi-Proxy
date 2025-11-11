"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Home,
  CreditCard,
  ArrowRight,
  Server,
  Key,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CheckoutSuccessClientProps {
  dict: any;
  lang: string;
}

export default function CheckoutSuccessClient({
  dict,
  lang,
}: CheckoutSuccessClientProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const nextSteps = [
    {
      icon: Server,
      title: dict.subscription.success.step1,
      href: `/${lang}/gateway?dft=private`,
    },
    {
      icon: Key,
      title: dict.subscription.success.step2,
      href: `/${lang}/token`,
    },
    {
      icon: BookOpen,
      title: dict.subscription.success.step3,
      href: `/${lang}/documentation`,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-2xl">
        {/* Success Icon with Animation */}
        <div
          className={cn(
            "flex justify-center mb-8 transition-all duration-700 ease-out",
            animateIn
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-4 scale-95"
          )}
        >
          <div className="relative">
            {/* Pulsing Background */}
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-6 shadow-2xl shadow-green-500/20">
              <CheckCircle2
                className="h-20 w-20 text-white"
                strokeWidth={2.5}
              />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div
          className={cn(
            "text-center mb-12 space-y-4 transition-all duration-700 delay-100 ease-out",
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {dict.subscription.success.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {dict.subscription.success.subtitle}
          </p>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            {dict.subscription.success.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          className={cn(
            "flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 delay-200 ease-out",
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all"
          >
            <Link href={`/${lang}`}>
              <Home className="mr-2 h-5 w-5" />
              {dict.subscription.success.backToHome}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group shadow-md hover:shadow-lg transition-all"
          >
            <Link href={`/${lang}/subscription`}>
              <CreditCard className="mr-2 h-5 w-5" />
              {dict.subscription.success.viewSubscription}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Next Steps Card */}
        <div
          className={cn(
            "rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 backdrop-blur-sm p-8 shadow-xl transition-all duration-700 delay-300 ease-out",
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {dict.subscription.success.nextSteps}
          </h2>
          <div className="grid gap-4">
            {nextSteps.map((step, index) => (
              <Link
                key={index}
                href={step.href}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex-shrink-0 p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="flex-1 text-lg font-medium group-hover:text-primary transition-colors">
                  {step.title}
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
