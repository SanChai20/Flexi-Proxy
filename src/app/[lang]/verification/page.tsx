import { Turnstile } from "@marsidev/react-turnstile";
import { redirect } from "next/navigation";
import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export default async function VerificationPage(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang as Locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-card p-8 shadow-lg border border-border">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            {dictionary.verification.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {dictionary.verification.description}
          </p>
        </div>

        {/* Turnstile */}
        <div className="flex justify-center">
          <Turnstile
            siteKey={process.env.TURNSTILE_SITE_KEY as string}
            onSuccess={async (token) => {
              "use server";
              redirect(`/${lang}/login?from=${token}`);
            }}
            options={{
              theme: "auto",
              size: "normal",
              language: "auto",
              retry: "auto",
              refreshExpired: "auto",
            }}
            className="mx-auto"
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {dictionary.verification.footer}
          </p>
        </div>
      </div>
    </div>
  );
}
