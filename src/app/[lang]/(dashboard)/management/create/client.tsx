"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdapterForm } from "../form";

interface CreateManagementClientProps {
  dict: any;
  proxies: any[];
  providers: Array<{
    name: string;
    id: string;
    website: string;
  }>;
  advRequest: boolean;
  version: number;
}

export default function CreateManagementClient({
  dict,
  proxies,
  providers,
  advRequest,
  version,
}: CreateManagementClientProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.tokenPassTitle || "Create Token Pass"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.tokenPassSubtitle ||
              "Obtain an Access Token for the Proxy Gateway Service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <AdapterForm
        dict={dict}
        proxies={proxies}
        providers={providers}
        advRequest={advRequest}
        version={version}
      />
    </>
  );
}
