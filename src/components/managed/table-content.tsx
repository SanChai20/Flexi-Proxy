"use client";

import ClipboardButton from "@/components/ui/clipboard-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Cog6ToothIcon,
  PlusIcon,
  ClipboardIcon,
} from "@heroicons/react/24/outline";
import { LoadingIcon } from "../ui/icons";
import { useAsyncFn } from "@/hooks/useAsyncFn";
import { useState } from "react";

interface AdapterRow {
  provider: string;
  url: string;
  token: string;
}

export default function TableContent({
  dict,
  token,
  onTokenExpired,
  onAdapterDeleted,
}: {
  dict: any;
  token: string;
  onTokenExpired: () => void;
  onAdapterDeleted: (token: string) => void;
}) {
  const [rows, setRows] = useState<AdapterRow[]>(
    userAvailableAdapters.map((adapter) => {
      return {
        provider: adapter.target.toUpperCase(),
        url: adapter.url,
        token: adapter.token,
      };
    })
  );

  const handleDeleteRow = async (adapter_token: string) => {
    await deleteAdapter(token, adapter_token);
  };

  const { execute: deleteAdapter, loading: isDeletingAdapter } = useAsyncFn<
    { token: string } | undefined,
    [string, string]
  >(
    async (token: string, adapter_token: string) => {
      //await new Promise(resolve => setTimeout(resolve, 3000));
      const response = await fetch("/api/adapters", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adapter_token,
        }),
      });
      if (response.ok) {
        return response.json();
      } else {
        return undefined;
      }
    },
    (result?: { token: string }) => {
      if (result !== undefined) {
        onAdapterDeleted(result.token);
      } else {
        onTokenExpired();
      }
    }
  );

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
        <table className="w-full min-w-[200px] md:min-w-full">
          {/* ----- Header ----- */}
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-2 py-3 text-xs text-left uppercase sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                {dict?.management?.provider || "Provider"}
              </th>
              <th className="px-2 py-3 text-xs text-left uppercase sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                {dict?.management?.baseUrl || "Base URL"}
              </th>
              <th className="px-2 py-3 text-xs text-left uppercase sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                {dict?.management?.apiKey || "API Key"}
              </th>
              <th className="px-2 py-3 text-xs text-right uppercase sm:px-5 sm:py-3.5 sm:text-sm sm:text-right">
                {dict?.management?.actions || "Actions"}
              </th>
            </tr>
          </thead>

          {/* ----- Body ----- */}
          <tbody className="divide-y divide-border">
            {rows.map((row, index) => (
              <tr
                key={row.token}
                className="hover:bg-muted/30 transition-colors duration-150"
              >
                <td className="px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                  {row.provider}
                </td>
                <td className="px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                  <div className="flex justify-start gap-1 xs:gap-2">
                    <span
                      className="font-mono text-[10px] xs:text-xs text-muted-foreground truncate max-w-[40px] xs:max-w-[50px] sm:max-w-[60px] md:text-sm md:max-w-[80px] lg:max-w-[150px] xl:max-w-[220px]"
                      title={row.url}
                    >
                      {row.url}
                    </span>
                    <ClipboardButton text={row.url} />
                  </div>
                </td>
                <td className="px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                  <div className="flex justify-start gap-1 xs:gap-2">
                    <span
                      className="font-mono text-[10px] xs:text-xs text-muted-foreground max-w-[40px] xs:max-w-[50px] sm:max-w-[60px] md:text-sm md:max-w-[80px] lg:max-w-[120px] xl:max-w-[150px] 
      inline-block overflow-hidden"
                      style={{
                        direction: "rtl",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={row.token}
                    >
                      <span style={{ direction: "ltr" }}>{row.token}</span>
                    </span>
                    <ClipboardButton text={row.token} />
                  </div>
                </td>

                {/* Settings 图标 + 下拉菜单 */}
                <td className="px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm sm:text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isDeletingAdapter}>
                      <button
                        type="button"
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 md:p-1.5"
                        aria-haspopup="true"
                      >
                        {isDeletingAdapter ? (
                          <LoadingIcon className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
                        ) : (
                          <Cog6ToothIcon className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32 xs:w-36 rounded-lg"
                    >
                      <DropdownMenuItem
                        onClick={() => handleDeleteRow(row.token)}
                        className="cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
                        disabled={isDeletingAdapter}
                      >
                        {dict?.management?.delete || "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
