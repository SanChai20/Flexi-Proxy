"use client";

import { LockIcon } from "@/components/ui/icons";
import { redirect } from "next/navigation";

export default function Unauthorized({
  dict,
}: {
  dict: {
    unauthorized: {
      title: string;
      subtitle: string;
      description: string;
      retry: string;
    };
  };
}) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-md border border-gray-200 text-center">
        
        {/* 图标 */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <LockIcon />
          </div>
        </div>

        {/* 文本 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            {dict.unauthorized.title}
          </h1>
          <p className="text-lg font-medium text-gray-700 mb-4">
            {dict.unauthorized.subtitle}
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            {dict.unauthorized.description}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => redirect("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md font-medium transition-colors hover:bg-blue-700"
          >
            {dict.unauthorized.retry}
          </button>
        </div>
      </div>
    </div>
  );
}
