import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { Metadata } from "next";

import { Suspense } from "react";
import SubscriptionSkeleton from "./skeleton";
import SubscriptionClient from "./client";
import {
  getCachedUserPermissions,
  getPriceDetails,
  getSubscription,
} from "@/lib/actions";

export const metadata: Metadata = {
  title: "FlexiProxy - Subscription Plans",
};

async function SubscriptionContent({ dict }: { dict: any }) {
  const [permissions, price, subscription] = await Promise.all([
    getCachedUserPermissions(),
    getPriceDetails(),
    getSubscription(),
  ]);

  return (
    <SubscriptionClient
      permissions={permissions}
      dict={dict}
      price={price}
      subscription={subscription}
    />
  );
}

export default async function SubscriptionPage(
  props: PageProps<"/[lang]/subscription">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<SubscriptionSkeleton />}>
        <SubscriptionContent dict={dict} />
      </Suspense>
    </section>
  );
}
