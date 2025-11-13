"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Loader2, Settings, Copy, Check } from "lucide-react";
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.token?.title || "Token Pass Management"}
            </CardTitle>
            <CreateAdapterForm
              dict={dict}
              currentAdapterCount={initialAdapters.length}
              maxAdapterCountAllowed={permissions.maa}
            />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.token?.subtitle ||
              "Managing Token Pass of LLM Proxy Services"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-md">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/30">
            <table className="w-full min-w-[200px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="w-[15%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.proxy || "Proxy Gateway"}
                  </th>
                  <th className="w-[40%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.baseUrl || "Base URL"}
                  </th>
                  <th className="w-[30%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.note || "Note"}
                  </th>
                  <th className="w-[10%] px-3 py-3 text-right sm:px-5 sm:py-4">
                    {dict?.token?.actions || "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {initialAdapters.map((adapter) => {
                  const isSubmitting = submittingAdapters.has(adapter.aid);
                  const isTokenCopied = copiedToken === adapter.aid;

                  return (
                    <tr
                      key={adapter.aid}
                      className="hover:bg-muted/20 transition-colors duration-200"
                    >
                      <td className="w-[15%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm text-left">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="whitespace-nowrap text-[11px] xs:text-xs md:text-sm">
                              {adapter.pid}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="w-[40%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm">
                        <div className="flex items-center gap-1 xs:gap-2">
                          <span
                            className="font-mono text-[11px] xs:text-xs md:text-sm text-muted-foreground truncate max-w-[280px] lg:max-w-[420px]"
                            title={adapter.pul}
                          >
                            {adapter.pul}
                          </span>
                          <ClipboardButton text={adapter.pul} />
                        </div>
                      </td>
                      <td className="w-[30%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm">
                        <span className="font-mono text-[11px] xs:text-xs md:text-sm text-muted-foreground truncate max-w-[240px] lg:max-w-[320px]">
                          {adapter.not}
                        </span>
                      </td>
                      <td className="w-[15%] px-3 py-3 text-sm text-right sm:px-5 sm:py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                            ) : (
                              <Settings className="h-5 w-5" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-lg shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                copyToClipboard(adapter.tk, adapter.aid)
                              }
                              className="cursor-pointer text-xs xs:text-sm"
                            >
                              <span>
                                {isTokenCopied
                                  ? dict?.token?.copied || "Copied!"
                                  : dict?.token?.copyToken || "Copy Token"}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <EditAdapterDropdownForm
                              dict={dict}
                              adapter_id={adapter.aid}
                              onSubmitStart={() =>
                                handleSubmitStart(adapter.aid)
                              }
                              onSubmitEnd={() => handleSubmitEnd(adapter.aid)}
                            />
                            <DeleteAdapterDropdownForm
                              dict={dict}
                              adapter_id={adapter.aid}
                              onSubmitStart={() =>
                                handleSubmitStart(adapter.aid)
                              }
                              onSubmitEnd={() => handleSubmitEnd(adapter.aid)}
                            />
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
