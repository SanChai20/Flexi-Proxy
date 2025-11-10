import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { Metadata } from "next";
import CheckoutSuccessClient from "./client";

export const metadata: Metadata = {
  title: "FlexiProxy - Subscription Checkout Success",
};

export default async function CheckoutSuccessPage(
  props: PageProps<"/[lang]/subscription/success">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <CheckoutSuccessClient dict={dict} lang={lang} />
    </section>
  );
}
