"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Loader2, Settings, Key, Link as LinkIcon } from "lucide-react";
import {
  CreateAdapterForm,
  DeleteAdapterDropdownForm,
  EditAdapterDropdownForm,
  TokenDialog,
} from "./form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface AccessTokenClientProps {
  dict: any;
  permissions: any;
  initialAdapters: any[];
  proxies: { id: string; url: string; status: string }[];
  models: {
    id: string;
    name: string;
  }[];
  version: number;
}

export default function AccessTokenClient({
  dict,
  permissions,
  initialAdapters,
  proxies,
  models,
  version,
}: AccessTokenClientProps) {
  const searchParams = useSearchParams();
  const [dialogMode, setDialogMode] = useState<string | null>(
    searchParams.get("mode") ?? null
  );
  const [editingAdapter, setEditingAdapter] = useState<any>(null);
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

  const handleCreateClick = () => {
    setDialogMode("create");
    setEditingAdapter(null);
  };

  const handleEditClick = (adapter: any) => {
    setDialogMode("edit");
    setEditingAdapter(adapter);
  };

  const handleCloseDialog = () => {
    setDialogMode(null);
    setEditingAdapter(null);
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
        <Card className="group relative overflow-hidden border-border/40 bg-gradient-to-br from-background via-background to-muted/20 transition-all hover:border-primary/30 hover:shadow-sm">
          <div className="p-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left Section - Token Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Key className="h-5 w-5" />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {dict?.token?.totalTokens || "Total Access Tokens"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums">
                      {initialAdapters.length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {permissions.maa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Action Button */}
              <CreateAdapterForm
                dict={dict}
                currentAdapterCount={initialAdapters.length}
                maxAdapterCountAllowed={permissions.maa}
                onOpenDialog={handleCreateClick}
              />
            </div>
          </div>

          {/* Optional: Progress indicator */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
              style={{
                width: `${(initialAdapters.length / permissions.maa) * 100}%`,
              }}
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
                        className="cursor-pointer text-xs xs:text-sm"
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
                        className="cursor-pointer text-xs xs:text-sm"
                      >
                        <span>
                          {dict?.token?.copyBaseUrl || "Copy Base URL"}
                        </span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {/* 修改 Edit 按钮 */}
                      <DropdownMenuItem
                        onClick={() => handleEditClick(adapter)}
                        className="cursor-pointer text-xs xs:text-sm"
                      >
                        <span>{dict?.token?.edit || "Edit"}</span>
                      </DropdownMenuItem>
                      <DeleteAdapterDropdownForm
                        dict={dict}
                        adapter_id={adapter.aid}
                        onSubmitStart={() => handleSubmitStart(adapter.aid)}
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

      {dialogMode && (
        <TokenDialog
          dict={dict}
          proxies={proxies}
          models={models}
          version={version}
          open={!!dialogMode}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
          }}
          dialogMode={dialogMode}
          defaultValues={
            dialogMode === "edit"
              ? {
                  aid: editingAdapter?.aid,
                  mid: editingAdapter?.mid ?? searchParams.get("mid"),
                  pid: editingAdapter?.pid ?? searchParams.get("pid"),
                  not: editingAdapter.not,
                }
              : {
                  aid: undefined,
                  mid: searchParams.get("mid") ?? undefined,
                  pid: searchParams.get("pid") ?? undefined,
                  not: undefined,
                }
          }
        />
      )}
    </div>
  );
}
