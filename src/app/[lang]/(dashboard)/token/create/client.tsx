"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TokenDialog } from "../dialog";

interface CreateAccessTokenClientProps {
  dict: any;
  proxies: any[];
  providers: Array<{
    name: string;
    id: string;
    website: string;
  }>;
  version: number;
  defaultProxyId?: any;
}

export default function CreateAccessTokenClient({
  dict,
  proxies,
  providers,
  version,
}: CreateAccessTokenClientProps) {
  const searchParams = useSearchParams();
  const [defaultProxyId, setDefaultProxyId] = useState<string | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    const urlProxyId = searchParams.get("proxyId");
    if (urlProxyId) {
      setDefaultProxyId(urlProxyId);
    }
  }, [searchParams]);
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
        <TokenDialog
          dict={dict}
          proxies={proxies}
          version={version}
          initProxyId={defaultProxyId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      ) : (
        <TokenDialog
          dict={dict}
          proxies={proxies}
          version={version}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}
