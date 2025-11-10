import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { Metadata } from "next";

import { Suspense } from "react";
import SubscriptionSkeleton from "./skeleton";
import SubscriptionClient from "./client";
import { getCachedUserPermissions, getPriceDetails } from "@/lib/actions";

export const metadata: Metadata = {
  title: "FlexiProxy - Subscription Plans",
};

async function SubscriptionContent({ dict }: { dict: any }) {
  const [permissions, price] = await Promise.all([
    getCachedUserPermissions(),
    getPriceDetails(),
  ]);

  return (
    <SubscriptionClient permissions={permissions} dict={dict} price={price} />
  );
}

export default async function SubscriptionPage(
  props: PageProps<"/[lang]/subscription">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<SubscriptionSkeleton dict={dict} />}>
        <SubscriptionContent dict={dict} />
      </Suspense>
    </section>
  );
}
