"use client";

import { useState } from "react";
import { Cog6ToothIcon, PlusIcon } from "@heroicons/react/24/outline";
import ProxyModal from "@/components/ui/proxymodal";

export interface ProviderRow {
  id: string;
  provider: string;
  baseUrl: string;
  authToken: string;
  status: "active" | "inactive";
}

/**
 * Provider 表格（含添加按钮、行设置图标）
 */
export default function ProxyTable({ dict }: { dict: any }) {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** 简单的“新增行”实现（真实项目请改成弹窗收集信息） */
  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: {
    provider: string;
    baseUrl: string;
    authToken: string;
  }) => {
    const newRow: ProviderRow = {
      id: crypto.randomUUID(),
      provider: data.provider,
      baseUrl: data.baseUrl,
      authToken: data.authToken,
      status: "inactive",
    };
    setRows((prev) => [...prev, newRow]);
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  /** 删除行 */
  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <section>
      {/* ---------- Header + "Add" 按钮 ---------- */}
      <div className="flex items-center justify-between pt-4 mb-4">
        <div className="my-0"></div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Provider
        </button>
      </div>

      {/* ---------- Proxy Modal ---------- */}
      <ProxyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        dict={dict}
      />

      {/* ---------- 表格容器 ---------- */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full table-auto">
          {/* ----- Header ----- */}
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left font-medium">Provider</th>
              <th className="p-3 text-left font-medium">Base URL</th>
              <th className="p-3 text-left font-medium">Auth Token</th>
              <th className="p-3 text-left font-medium">Status</th>
              {/* Settings 列（保持空宽度） */}
              <th className="p-3 w-12"></th>
            </tr>
          </thead>

          {/* ----- Body ----- */}
          <tbody className="divide-y divide-border">
            {/* ---------- 有数据时每行 ---------- */}
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition">
                <td className="p-3">{row.provider}</td>
                <td className="p-3 break-all">{row.baseUrl}</td>
                <td className="p-3 font-mono">{row.authToken}</td>
                <td className="p-3">
                  <span
                    className={`
                      inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium
                      ${
                        row.status === "active"
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }
                    `}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Settings 图标 + 简易下拉菜单 */}
                <td className="p-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/30 transition"
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

            {/* ---------- 没有任何行时的占位 ---------- */}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center align-middle">
                  <p className="text-muted-foreground m-0">
                    暂无数据，先添加一个 Provider 吧~
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
