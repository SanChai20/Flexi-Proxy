"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProxyList } from "@/components/ProxyList";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import ProxyTable from "@/components/ui/proxy";

// Define the proxy type
interface Proxy {
  id: string;
  provider: string;
  baseUrl: string;
  authToken: string;
  status: string;
}

export default function ManagementPage(props: LayoutProps<"/[lang]">) {
  // Sample data - in a real app, this would come from an API
  const [proxies, setProxies] = useState<Proxy[]>([
    {
      id: "1",
      provider: "OpenAI",
      baseUrl: "https://api.openai.com/v1",
      authToken: "sk-...xyz123",
      status: "active",
    },
    {
      id: "2",
      provider: "Anthropic",
      baseUrl: "https://api.anthropic.com/v1",
      authToken: "sk-ant-...abc456",
      status: "inactive",
    },
    {
      id: "3",
      provider: "Google",
      baseUrl: "https://generativelanguage.googleapis.com/v1",
      authToken: "AIza...def789",
      status: "active",
    },
  ]);

  const handleAddProxy = () => {
    // Add a new sample proxy
    const newProxy: Proxy = {
      id: (proxies.length + 1).toString(),
      provider: "New Provider",
      baseUrl: "https://api.newprovider.com/v1",
      authToken: "sk-new-...ghi012",
      status: "inactive",
    };
    setProxies([...proxies, newProxy]);
  };

  const handleEditProxy = (id: string) => {
    // In a real app, this would open a modal or navigate to an edit form
    console.log("Edit proxy", id);
    // For demo purposes, let's toggle the status
    setProxies(
      proxies.map((proxy) =>
        proxy.id === id
          ? {
              ...proxy,
              status: proxy.status === "active" ? "inactive" : "active",
            }
          : proxy
      )
    );
  };

  const handleDeleteProxy = (id: string) => {
    setProxies(proxies.filter((proxy) => proxy.id !== id));
  };

  return (
    <section className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Base URL Management</CardTitle>
          <CardDescription className="text-base">
            Manage your OpenAI-compatible Base URLs
          </CardDescription>
        </CardHeader>
        {/* <CardContent>

          
        </CardContent> */}
      </Card>
      <ProxyTable />
    </section>
  );
}
