import { verifyShortTimeToken } from "@/lib/actions";
import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import GatewayPrivateSkeleton from "./skeleton";
import { Metadata } from "next";
import GatewayPrivateClient from "./client";

export const metadata: Metadata = {
  title: "FlexiProxy - Gateways",
};

export default async function GatewayPrivatePage(
  props: PageProps<"/[lang]/gateway/private">
) {
  const { lang } = await props.params;
  const { sub, token } = await props.searchParams;

  if (typeof sub !== "string" || typeof token !== "string") {
    redirect(`/${lang}/gateway?gtwType=public`);
  }

  const isValid = await verifyShortTimeToken(token);
  if (!isValid) {
    redirect(`/${lang}/gateway?gtwType=public`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<GatewayPrivateSkeleton dict={dict} />}>
        <GatewayPrivateClient dict={dict} sub={sub} />
      </Suspense>
    </section>
  );
}
