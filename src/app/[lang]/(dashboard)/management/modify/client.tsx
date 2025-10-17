"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdapterForm } from "../form";

interface ModifyManagementClientProps {
  dict: any;
  proxies: any[];
  providers: Array<{
    name: string;
    id: string;
    website: string;
  }>;
  advRequest: boolean;
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

export default function ModifyManagementClient({
  dict,
  proxies,
  providers,
  advRequest,
  version,
  defaultValues,
}: ModifyManagementClientProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.keyTitle || "Modify Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.keySubtitle ||
              "Refresh the Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm
        dict={dict}
        proxies={proxies}
        providers={providers}
        advRequest={advRequest}
        version={version}
        defaultValues={defaultValues}
      />
    </>
  );
}
