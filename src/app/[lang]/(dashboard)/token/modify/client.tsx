"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TokenDialog } from "../dialog";
import { useState } from "react";

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
    commentNote: string;
  };
}

export default function ModifyAccessTokenClient({
  dict,
  proxies,
  providers,
  version,
  defaultValues,
}: ModifyAccessTokenClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
      <TokenDialog
        dict={dict}
        proxies={proxies}
        version={version}
        defaultValues={defaultValues}
        initProxyId={defaultValues.proxyId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
