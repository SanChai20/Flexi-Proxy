import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { Metadata } from "next";

import CheckoutClient from "./client";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "FlexiProxy - Subscription Checkout",
};

async function CheckoutContent({
  dict,
  lang,
  quantity,
  id,
  userId,
  userEmail,
}: {
  dict: any;
  lang: string;
  quantity: number;
  id: string;
  userId: string;
  userEmail: string;
}) {
  return (
    <CheckoutClient
      dict={dict}
      lang={lang}
      priceId={id}
      quantity={quantity}
      userId={userId}
      userEmail={userEmail}
    />
  );
}

export default async function CheckoutPage(
  props: PageProps<"/[lang]/subscription/checkout">
) {
  const { lang } = await props.params;
  const { quantity, priceId } = await props.searchParams;
  if (typeof quantity !== "string" || typeof priceId !== "string") {
    return null;
  }
  const dict = await getTrans(lang as Locale);
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <CheckoutContent
        dict={dict}
        lang={lang}
        quantity={parseInt(quantity)}
        id={priceId}
        userId={session.user.id}
        userEmail={session.user.email || ""}
      />
    </section>
  );
}
