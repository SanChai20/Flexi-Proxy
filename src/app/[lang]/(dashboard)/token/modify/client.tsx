"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdapterForm } from "../form";

interface ModifyAccessTokenClientProps {
  dict: any;
  proxies: any[];
  providers: Array<{
    name: string;
    id: string;
    website: string;
  }>;
  version: number;
  defaultValues: {
    adapterId: string;
    modelId: string;
    proxyId: string;
    providerId: string;
    commentNote: string;
    litellmParams: string;
  };
}

export default function ModifyAccessTokenClient({
  dict,
  proxies,
  providers,
  version,
  defaultValues,
}: ModifyAccessTokenClientProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.token?.keyTitle || "Modify Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.token?.keySubtitle ||
              "Refresh the Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm
        dict={dict}
        proxies={proxies}
        providers={providers}
        version={version}
        defaultValues={defaultValues}
        initProxyId={defaultValues.proxyId}
      />
    </>
  );
}
