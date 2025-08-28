"use client";

export function ContentDisplay({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center min-h-screen px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
