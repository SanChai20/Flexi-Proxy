import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import { Metadata } from "next";

import { Suspense } from "react";
import GatewaySkeleton from "./skeleton";
import GatewayClient from "./client";
import {
  checkProxyServerHealth,
  getAllPrivateProxyServers,
  getAllPublicProxyServers,
  getCachedUserPermissions,
  getUserAdaptersCount,
} from "@/lib/actions";
export const metadata: Metadata = {
  title: "FlexiProxy - Gateways",
};

async function GatewayContent({ dict, type }: { dict: any; type: string }) {
  const [permissions, publicChecks, privateChecks, userAccessTokenCount] =
    await Promise.all([
      getCachedUserPermissions(),
      getAllPublicProxyServers().then((proxies) =>
        Promise.all(proxies.map(checkProxyServerHealth))
      ),
      getAllPrivateProxyServers().then((proxies) =>
        Promise.all(proxies.map(checkProxyServerHealth))
      ),
      getUserAdaptersCount(),
    ]);

  return (
    <GatewayClient
      permissions={permissions}
      dict={dict}
      proxyServers={[...publicChecks, ...privateChecks]}
      userTokenCount={userAccessTokenCount}
      gatewayType={type}
    />
  );
}

export default async function GatewayPage(props: PageProps<"/[lang]/gateway">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  const { gtwType } = await props.searchParams;
  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
      <Suspense fallback={<GatewaySkeleton dict={dict} />}>
        <GatewayContent
          dict={dict}
          type={typeof gtwType === "string" ? gtwType : "public"}
        />
      </Suspense>
    </section>
  );
}
