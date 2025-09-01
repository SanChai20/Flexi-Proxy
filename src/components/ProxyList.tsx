"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icons";
import { ProxyItem } from "@/components/ProxyItem";

interface Proxy {
  id: string;
  provider: string;
  baseUrl: string;
  authToken: string;
  status: string;
}

interface ProxyListProps {
  proxies: Proxy[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ProxyList({ proxies, onAdd, onEdit, onDelete }: ProxyListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-4 gap-4 p-4 text-sm font-medium text-muted-foreground border-b flex-1">
          <div>Provider</div>
          <div>Base Url</div>
          <div>Auth Token</div>
          <div>Status</div>
        </div>
        <div className="ml-4">
          <Button onClick={onAdd} className="flex items-center gap-2" size="sm">
            <PlusIcon className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        {proxies.length > 0 ? (
          proxies.map((proxy) => (
            <ProxyItem
              key={proxy.id}
              provider={proxy.provider}
              baseUrl={proxy.baseUrl}
              authToken={proxy.authToken}
              status={proxy.status}
              onEdit={() => onEdit(proxy.id)}
              onDelete={() => onDelete(proxy.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No proxies configured yet</p>
            <Button onClick={onAdd} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Your First Proxy
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}