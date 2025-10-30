import { verifyShortTimeToken } from "@/lib/actions";
import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import GatewayPrivateSkeleton from "./skeleton";
import { Metadata } from "next";
// import GatewayPrivateClient from "./client";
import { EC2LogViewer } from "@/components/ui/log-viewer";

export const metadata: Metadata = {
  title: "FlexiProxy - Gateways",
};

// async function GatewayPrivateContent({
//   dict,
//   sub,
// }: {
//   dict: any;
//   sub: string;
// }) {
//   const logStreams = await cloudWatchLogs(sub);
//   return <GatewayPrivateClient dict={dict} sub={sub} logStream={logStreams} />;
// }

export default async function GatewayPrivatePage(
  props: PageProps<"/[lang]/gateway/private">
) {
  const { lang } = await props.params;
  const { sub, token } = await props.searchParams;

  if (typeof sub !== "string" || typeof token !== "string") {
    redirect(`/${lang}/gateway`);
  }

  const isValid = await verifyShortTimeToken(token);
  if (!isValid) {
    redirect(`/${lang}/gateway`);
  }

  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-4 py-6 select-none">
      <Suspense fallback={<GatewayPrivateSkeleton dict={dict} />}>
        <EC2LogViewer dict={dict} subdomain={sub} />
      </Suspense>
    </section>
  );
}
