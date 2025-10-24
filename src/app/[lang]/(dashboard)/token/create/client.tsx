"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdapterForm } from "../form";

interface CreateAccessTokenClientProps {
  dict: any;
  proxies: any[];
  providers: Array<{
    name: string;
    id: string;
    website: string;
  }>;
  advRequest: boolean;
  version: number;
  defaultProxyId?: any;
}

export default function CreateAccessTokenClient({
  dict,
  proxies,
  providers,
  advRequest,
  version,
  defaultProxyId,
}: CreateAccessTokenClientProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.token?.tokenPassTitle || "Create Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.token?.tokenPassSubtitle ||
              "Obtain an Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>
      {typeof defaultProxyId === "string" && defaultProxyId.length > 0 ? (
        <AdapterForm
          dict={dict}
          proxies={proxies}
          providers={providers}
          advRequest={advRequest}
          version={version}
          defaultValues={{
            adapterId: "",
            modelId: "",
            proxyId: defaultProxyId,
            providerId: "",
            commentNote: "",
            litellmParams: "",
          }}
        />
      ) : (
        <AdapterForm
          dict={dict}
          proxies={proxies}
          providers={providers}
          advRequest={advRequest}
          version={version}
        />
      )}
    </>
  );
}
