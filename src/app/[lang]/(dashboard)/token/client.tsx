"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Loader2, Settings, Key, Link as LinkIcon } from "lucide-react";
import {
  CreateAdapterForm,
  DeleteAdapterDropdownForm,
  EditAdapterDropdownForm,
} from "./form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface AccessTokenClientProps {
  dict: any;
  permissions: any;
  initialAdapters: any[];
}

export default function AccessTokenClient({
  dict,
  permissions,
  initialAdapters,
}: AccessTokenClientProps) {
  const [submittingAdapters, setSubmittingAdapters] = useState<Set<string>>(
    new Set()
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleSubmitStart = (adapterId: string) => {
    setSubmittingAdapters((prev) => new Set(prev).add(adapterId));
  };

  const handleSubmitEnd = (adapterId: string) => {
    setSubmittingAdapters((prev) => {
      const newSet = new Set(prev);
      newSet.delete(adapterId);
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, adapterId: string) => {
    try {
      if (!text) {
        return;
      }

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!successful) {
            throw new Error("Failed to copy text");
          }
        } catch (err) {
          document.body.removeChild(textArea);
          throw err;
        }
      }

      setCopiedToken(adapterId);

      setTimeout(() => {
        setCopiedToken(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy token: ", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-0 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold mb-2">
          {dict?.token?.title || "Token Pass Management"}
        </h1>
        <p className="text-muted-foreground">
          {dict?.token?.subtitle || "Managing Token Pass of LLM Proxy Services"}
        </p>
      </div>

      {/* Token Count Badge with Add Button */}
      <div className="mb-6">
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-primary" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {dict?.token?.totalTokens || "Total Access Tokens"}:
                </span>
                <Badge variant="secondary" className="font-semibold">
                  {initialAdapters.length} / {permissions.maa}
                </Badge>
              </div>
            </div>
            <CreateAdapterForm
              dict={dict}
              currentAdapterCount={initialAdapters.length}
              maxAdapterCountAllowed={permissions.maa}
            />
          </div>
        </Card>
      </div>

      {/* Tokens List */}
      <Card>
        <div className="divide-y divide-border">
          {initialAdapters.map((adapter) => {
            const isSubmitting = submittingAdapters.has(adapter.aid);
            const isTokenCopied = copiedToken === adapter.aid;

            return (
              <div
                key={adapter.aid}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge
                      variant="outline"
                      className="font-mono text-xs shrink-0"
                    >
                      {adapter.pid}
                    </Badge>
                    {adapter.not && (
                      <span className="text-sm text-muted-foreground truncate">
                        {adapter.not}
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Settings className="h-4 w-4" />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => copyToClipboard(adapter.tk, adapter.aid)}
                        className="cursor-pointer"
                      >
                        <span>
                          {isTokenCopied
                            ? dict?.token?.copied || "Copied!"
                            : dict?.token?.copyToken || "Copy Token"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          copyToClipboard(adapter.pul, adapter.aid)
                        }
                        className="cursor-pointer"
                      >
                        <span>
                          {dict?.token?.copyBaseUrl || "Copy Base URL"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <EditAdapterDropdownForm
                        dict={dict}
                        adapter_id={adapter.aid}
                        onSubmitStart={() => handleSubmitStart(adapter.aid)}
                        onSubmitEnd={() => handleSubmitEnd(adapter.aid)}
                      />
                      <DeleteAdapterDropdownForm
                        dict={dict}
                        adapter_id={adapter.aid}
                        onSubmitStart={() => handleSubmitEnd(adapter.aid)}
                        onSubmitEnd={() => handleSubmitEnd(adapter.aid)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Empty State */}
      {initialAdapters.length === 0 && (
        <Card className="p-12 text-center border-dashed">
          <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {dict?.token?.noTokens || "No Access Tokens"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dict?.token?.createFirst ||
              "Create your first access token to get started"}
          </p>
        </Card>
      )}
    </div>
  );
}
