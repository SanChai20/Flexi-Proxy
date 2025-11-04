"use client";

import { LockIcon } from "@/components/ui/icons";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md p-10 rounded-lg border bg-card text-card-foreground shadow-md text-center">
        {/* 图标 */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LockIcon />
          </div>
        </div>

        {/* 文本 */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-3">
            {dict.unauthorized.title || "Unauthorized Access"}
          </h1>
          <p className="text-lg font-medium text-muted-foreground mb-4">
            {dict.unauthorized.subtitle ||
              "You don't have permission to access this page"}
          </p>
          <p className="text-base leading-relaxed text-muted-foreground">
            {dict.unauthorized.description ||
              "Please sign in with a valid account"}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex justify-center mt-8">
          <button
            onClick={async () => router.push("/login")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors bg-primary text-primary-foreground hover:opacity-90"
          >
            {dict.unauthorized.retry || "Retry"}
          </button>
        </div>
      </div>
    </div>
  );
}
