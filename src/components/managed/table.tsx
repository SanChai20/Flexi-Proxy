"use client";

import { useState } from "react";
import { Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline";
import ManagedModal from "@/components/managed/modal";
import { useAsyncFn } from "@/hooks/useAsyncFn";
import { jwtSign } from "@/lib/jwt";

export interface AdapterRow {
  provider: string;
  url: string;
  token: string;
}

export const PROVIDER_OPTIONS = [{ id: "anthropic", name: "Anthropic" }];

/**
 * Provider 表格（含添加按钮、行设置图标）
 */
export default function ManagedTable({
  dict,
  targetAvailableProviders,
  userAvailableAdapters,
}: {
  dict: any;
  targetAvailableProviders: string[];
  userAvailableAdapters: { target: string; token: string; url: string }[];
}) {
  const { execute: createAdapter, loading: isCreatingAdapter } = useAsyncFn(
    async (
      provider_id: string,
      base_url: string,
      api_key: string,
      model_id: string
    ) => {
      const token = await jwtSign({ provider_id, base_url, api_key, model_id });
      const response = await fetch("/api/adapters", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    }
  );

  const { execute: deleteAdapter, loading: isDeletingAdapter } = useAsyncFn(
    async (delete_index: number) => {
      const token = await jwtSign({ delete_index }, 60);
      const response = await fetch("/api/adapters", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.json();
    }
  );

  const [rows, setRows] = useState<AdapterRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    // await deleteAdapter();
    // setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleModalSubmit = async (data: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    modelId: string;
  }) => {
    const adapter = await createAdapter(
      data.provider,
      data.baseUrl,
      data.apiKey,
      data.modelId
    );
    const newRow: AdapterRow = {
      provider: adapter.target.toUpperCase(),
      url: adapter.url,
      token: adapter.token,
    };
    setRows((prev) => [...prev, newRow]);
    setIsModalOpen(false);
  };

  return (
    <section>
      {/* ---------- Header + "Add" 按钮 ---------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {dict.management.adapters}
          </h3>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 active:bg-primary/90 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4" />
            {dict.management.adapterAdd}
          </button>
        </div>

        {/* ---------- Proxy Modal ---------- */}
        <ManagedModal
          isOpen={isModalOpen && !isCreatingAdapter && !isDeletingAdapter}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          targetProviders={targetAvailableProviders}
          dict={dict}
        />

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-border rounded-lg bg-card">
            <svg
              className="w-12 h-12 text-muted-foreground mb-4"
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
            <h3 className="text-lg font-medium text-foreground mb-2">
              {dict.management.noAdapters}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {dict.management.noAdaptersDescription}
            </p>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              {dict.management.addFirstAdapter}
            </button>
          </div>
        ) : (
          <div className="border border-border rounded-lg bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                {/* ----- Header ----- */}
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-3 text-left font-medium">Provider</th>
                    <th className="p-3 text-left font-medium">Base URL</th>
                    <th className="p-3 text-left font-medium">Auth Token</th>
                    <th className="p-3 text-left font-medium">Model ID</th>
                    <th className="p-3 text-left font-medium">Headers</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    {/* Settings 列（保持空宽度） */}
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>

                {/* ----- Body ----- */}
                <tbody className="divide-y divide-border">
                  {rows.map((row) => (
                    <tr
                      key={row.token}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">{row.provider}</td>
                      <td className="p-3 break-all">{row.url}</td>
                      <td className="p-3 font-mono">{row.token}</td>

                      {/* Settings 图标 + 简易下拉菜单 */}
                      <td className="p-3 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                            aria-haspopup="true"
                          >
                            <Cog6ToothIcon className="h-5 w-5" />
                          </button>

                          {/* 简易下拉（实际项目建议使用 Radix UI / Headless UI） */}
                          <div className="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-popover shadow-lg ring-1 ring-border hidden group-hover:block">
                            <ul className="py-1">
                              <li>
                                <button
                                  onClick={() => alert(`编辑 ${row.provider}`)}
                                  className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                                >
                                  Edit
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
