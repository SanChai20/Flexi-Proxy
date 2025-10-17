"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Loader2, Settings } from "lucide-react";
import {
  CreateAdapterForm,
  DeleteAdapterDropdownForm,
  EditAdapterDropdownForm,
} from "./form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface ManagementClientProps {
  dict: any;
  permissions: any;
  initialAdapters: any[];
}

export default function ManagementClient({
  dict,
  permissions,
  initialAdapters,
}: ManagementClientProps) {
  const [submittingAdapters, setSubmittingAdapters] = useState<Set<string>>(
    new Set()
  );

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
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.management?.title || "Token Pass Management"}
            </CardTitle>
            <CreateAdapterForm
              dict={dict}
              currentAdapterCount={initialAdapters.length}
              maxAdapterCountAllowed={permissions.maa}
            />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.management?.subtitle ||
              "Managing Token Pass of LLM Proxy Services"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            <table className="w-full min-w-[200px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.proxy || "Proxy Gateway"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.baseUrl || "Base URL"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.tokenPass || "Token Pass (API Key)"}
                  </th>
                  <th className="w-2/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.note || "Note"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.actions || "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {initialAdapters.map((adapter) => {
                  const isSubmitting = submittingAdapters.has(adapter.aid);
                  return (
                    <tr
                      key={adapter.aid}
                      className="hover:bg-muted/30 transition-colors duration-150"
                    >
                      <td className="w-1/6 px-2 py-3 text-xs sm:px-5 sm:py-3.5 sm:text-sm">
                        <span className="text-[10px] xs:text-xs md:text-sm whitespace-nowrap">
                          {adapter.pid}
                          {adapter.ava
                            ? ""
                            : " (" + dict?.management?.unavailable + ")"}
                        </span>
                      </td>
                      <td className="w-1/6 px-2 py-3 text-xs sm:px-5 sm:py-3.5 sm:text-sm">
                        <div className="flex justify-start gap-1 xs:gap-2">
                          <span
                            className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap truncate max-w-[140px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[240px]"
                            title={adapter.pul}
                          >
                            {adapter.pul}
                          </span>
                          <ClipboardButton text={adapter.pul} />
                        </div>
                      </td>
                      <td className="w-1/6 px-2 py-3 text-xs sm:px-5 sm:py-3.5 sm:text-sm">
                        <div className="flex justify-start gap-1 xs:gap-2">
                          <span
                            className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap truncate max-w-[80px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[180px]"
                            title={adapter.tk}
                          >
                            {adapter.tk}
                          </span>
                          <ClipboardButton text={adapter.tk} />
                        </div>
                      </td>
                      <td className="w-2/6 px-2 py-3 text-xs sm:px-5 sm:py-3.5 sm:text-sm">
                        <span className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap max-w-[140px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[240px]">
                          {adapter.not}
                        </span>
                      </td>
                      <td className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 md:p-1.5"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Settings className="h-5 w-5" />
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-32 xs:w-36 rounded-lg"
                          >
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
