import Link from "next/link";
import { auth, signIn } from "@/auth";
import { providerMap } from "@/auth.config";
import { AuthProviderIcon } from "@/components/ui/icons";
import { Metadata } from "next";

import Unauthorized from "@/components/ui/unauthorized";
import { OnceButton } from "@/components/ui/oncebutton";
import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/lib/get-dictionary";

export const metadata: Metadata = {
  title: "Login - FlexiProxy",
  description: "Sign in to your account",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const verifyToken = async (token: string | null): Promise<boolean> => {
  if (!token) return false;

  const validateResponse = await fetch(
    [process.env.BASE_URL || "https://router.fit", "api/verify"].join("/"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }
  );

  if (!validateResponse.ok) return false;
  const data = await validateResponse.json();
  return data.success !== false;
};

export default async function LoginPage(props: {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ from: string | undefined }>;
}) {
  const { lang } = await props.params;
  const { from } = await props.searchParams;
  const dict = await getDictionary(lang);

  if (!from || typeof from !== "string") return <Unauthorized dict={dict} />;
  const isVerified = await verifyToken(from);
  if (!isVerified) return <Unauthorized dict={dict} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg border border-border">
        {/* Logo and Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            {dict.login.title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {dict.login.subtitle}
          </p>
        </div>

        {/* Login Card */}
        <div className="space-y-6">
          {/* Email Login Form */}
          <form
            className="space-y-4"
            action={async (formData) => {
              "use server";
              await signIn("resend", formData);
            }}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-muted-foreground"
              >
                {dict.login.email}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="mt-1 block w-full rounded-lg border border-input px-3 py-2 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
                required
              />
            </div>
            <OnceButton
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
            >
              {dict.login.emailLogin}
            </OnceButton>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {Object.values(providerMap).map((provider) => (
              <form
                key={provider.id}
                action={async () => {
                  "use server";
                  await signIn(provider.id);
                }}
              >
                <OnceButton
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-card-foreground shadow-sm transition hover:opacity-90"
                >
                  <AuthProviderIcon
                    providerId={provider.id}
                    className="h-5 w-5"
                  />
                  <span>
                    {dict.login.use} {provider.name}
                  </span>
                </OnceButton>
              </form>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {dict.login.agree}{" "}
          <Link
            href="/terms"
            className="font-medium text-primary hover:opacity-90"
          >
            {dict.login.terms}
          </Link>{" "}
          {dict.login.and}{" "}
          <Link
            href="/policy"
            className="font-medium text-primary hover:opacity-90"
          >
            {dict.login.policy}
          </Link>
        </p>
      </div>
    </div>
  );
}
