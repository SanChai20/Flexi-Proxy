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
    <div className="flex justify-center items-center min-h-screen px-4 py-8 bg-background">
      <div className="w-full max-w-4xl rounded-2xl bg-card p-8 shadow-lg border border-border">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-card-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
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
