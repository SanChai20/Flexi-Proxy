"use client";

import { useState } from "react";
import { Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline";
import ManagedModal from "@/components/managed/modal";
import { useAsyncFn } from "@/hooks/useAsyncFn";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AdapterRow {
  provider: string;
  url: string;
  token: string;
}

export default function ManagedTable({
  dict,
  token,
  targetAvailableProviders,
  userAvailableAdapters,
}: {
  dict: any;
  token: string;
  targetAvailableProviders: { id: string; url: string }[];
  userAvailableAdapters: { target: string; token: string; url: string }[];
}) {
  const router = useRouter();
  const { execute: createAdapter, loading: isCreatingAdapter } = useAsyncFn<
    { target: string; token: string; url: string } | undefined,
    [string, string, string, string, string]
  >(
    async (
      token: string,
      provider_id: string,
      base_url: string,
      api_key: string,
      model_id: string
    ) => {
      const response = await fetch("/api/adapters", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider_id,
          base_url,
          api_key,
          model_id,
        }),
      });

      if (response.ok) {
        return response.json();
      } else {
        return undefined;
      }
    },
    (result?: { target: string; token: string; url: string }) => {
      if (result !== undefined) {
        setRows((prev) => [
          ...prev,
          {
            provider: result.target.toUpperCase(),
            url: result.url,
            token: result.token,
          },
        ]);
        setIsModalOpen(false);
      } else {
        //Try verify
        router.push("/login");
      }
    }
  );

  const { execute: deleteAdapter, loading: isDeletingAdapter } = useAsyncFn<
    { token: string } | undefined,
    [string, string]
  >(
    async (token: string, adapter_token: string) => {
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
        setRows((prev) => prev.filter((r) => r.token !== result.token));
      } else {
        //Try verify
        router.push("/login");
      }
    }
  );

  const [rows, setRows] = useState<AdapterRow[]>(
    userAvailableAdapters.map((adapter) => {
      return {
        provider: adapter.target.toUpperCase(),
        url: adapter.url,
        token: adapter.token,
      };
    })
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDeleteRow = async (adapter_token: string) => {
    await deleteAdapter(token, adapter_token);
  };

  const handleModalSubmit = async (data: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    modelId: string;
  }) => {
    await createAdapter(
      token,
      data.provider,
      data.baseUrl,
      data.apiKey,
      data.modelId
    );
  };

  return (
    <section className="space-y-6">
      {/* ---------- Header + "Add" 按钮 ---------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">
          {dict.management.adapters}
        </h2>
        <button
          type="button"
          onClick={handleModalOpen}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/90 transition-all duration-200 whitespace-nowrap"
        >
          <PlusIcon className="h-4 w-4" />
          {dict.management.adapterAdd}
        </button>
      </div>

      {/* ---------- Proxy Modal ---------- */}
      <ManagedModal
        isOpen={isModalOpen}
        isSubmitting={isCreatingAdapter}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        targetProviders={targetAvailableProviders}
        dict={dict}
      />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-border rounded-xl bg-card shadow-sm">
          <div className="bg-muted p-4 rounded-full mb-5">
            <svg
              className="w-10 h-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {dict.management.noAdapters}
          </h3>
          <p className="text-base text-muted-foreground mb-6 max-w-md">
            {dict.management.noAdaptersDescription}
          </p>
          <button
            type="button"
            onClick={handleModalOpen}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/90 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4" />
            {dict.management.addFirstAdapter}
          </button>
        </div>
      ) : (
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* ----- Header ----- */}
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">
                    Base URL
                  </th>
                  <th className="px-5 py-3.5 text-left text-sm font-semibold uppercase tracking-wider">
                    Auth Token
                  </th>
                  <th className="px-5 py-3.5 text-right text-sm font-semibold uppercase tracking-wider w-12">
                    Actions
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
                    <td className="px-5 py-4 font-medium text-foreground">
                      {row.provider}
                    </td>
                    <td
                      className="px-5 py-4 text-muted-foreground max-w-xs truncate"
                      title={row.url}
                    >
                      {row.url}
                    </td>
                    <td
                      className="px-5 py-4 font-mono text-sm text-muted-foreground truncate max-w-xs"
                      title={row.token}
                    >
                      {row.token}
                    </td>

                    {/* Settings 图标 + 下拉菜单 */}
                    <td className="px-5 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
                            aria-haspopup="true"
                          >
                            <Cog6ToothIcon className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36 rounded-lg"
                        >
                          <DropdownMenuItem
                            onClick={() => alert(`编辑 ${row.provider}`)}
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRow(row.token)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            Delete
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
      )}
    </section>
  );
}
