import { Locale } from "i18n-config";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTrans } from "@/lib/dictionary";
import { UserIcon } from "@/components/ui/icons";
import { getCachedUserPermissions } from "@/lib/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const session = await auth();
  const dict = await getTrans(lang as Locale);

  // Check if user is logged in
  const isLoggedIn = !!(session && session.user && session.user.id);

  let userPermissions = null;
  if (isLoggedIn) {
    userPermissions = await getCachedUserPermissions();
  }

  let userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  let userAvatar = session?.user?.image;
  let userEmail = session?.user?.email;

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-4 py-8 select-none">
      {isLoggedIn ? (
        // Logged in view - User Dashboard
        <div className="flex flex-col items-center justify-center mb-12 animate-in fade-in duration-700">
          <div className="relative group">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-28 h-28 rounded-full object-cover border-4 border-gradient-to-br from-blue-400/50 via-purple-400/50 to-pink-400/50 shadow-2xl ring-4 ring-blue-500/10 transition-transform group-hover:scale-105 duration-300"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-4 border-gradient-to-br from-blue-400/50 via-purple-400/50 to-pink-400/50 flex items-center justify-center shadow-2xl ring-4 ring-blue-500/10 transition-transform group-hover:scale-105 duration-300">
                <UserIcon className="w-14 h-14 text-blue-500/80" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-3 border-background shadow-lg animate-pulse"></div>
          </div>

          <h1 className="text-4xl font-bold mt-8 text-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent">
            {userName}
          </h1>

          {userEmail && (
            <p className="text-muted-foreground mt-3 text-center text-base">
              {userEmail}
            </p>
          )}

          <div
            className={`mt-8 px-6 py-3 rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-105 ${
              userPermissions?.adv
                ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border-purple-400/30 shadow-lg shadow-purple-500/20"
                : "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 shadow-lg shadow-blue-500/10"
            }`}
          >
            <p
              className={`text-base font-semibold flex items-center gap-2 ${
                userPermissions?.adv
                  ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
              }`}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></span>
              {userPermissions?.adv
                ? dict?.home?.pro || "Pro Plan"
                : dict?.home?.free || "Free Plan"}
            </p>
          </div>
        </div>
      ) : (
        // Not logged in view - Product Overview
        <div className="flex flex-col items-center justify-center mb-12 animate-in fade-in duration-700">
          {/* Hero Section */}
          <div className="text-center mb-10 relative">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-in slide-in-from-bottom duration-1000">
              FlexiProxy
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {dict?.home?.subtitle ||
                "LLM Service Proxy Gateway, Breaking Regional & Pricing Barriers"}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-14">
            <Link href={`/${lang}/verification`}>
              <Button
                size="lg"
                className="font-semibold shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                {dict?.home?.getStarted || "Get Started"}
              </Button>
            </Link>
            <Link href={`/${lang}/documentation`}>
              <Button
                variant="outline"
                size="lg"
                className="font-semibold border-2 hover:bg-accent/50 hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {dict?.home?.learnMore || "Learn More"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Features Section - Always shown */}
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-blue-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {dict?.home?.feature1Title || "Unified Interface"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature1Subtitle ||
                "One API to access multiple LLM providers"}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-purple-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {dict?.home?.feature2Title || "Break Barriers"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature2Subtitle ||
                "Overcome regional restrictions and high costs"}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-green-400/50 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-green-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {dict?.home?.feature3Title || "Easy to Use"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature3Subtitle ||
                "Compatible with existing AI clients"}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-orange-400/50 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-orange-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              {dict?.home?.feature4Title || "High Performance"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature4Subtitle ||
                "Built on LiteLLM, low latency and high availability"}
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {dict?.home?.feature5Title || "Secure & Reliable"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature5Subtitle ||
                "End-to-end encryption, secure API key management"}
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card via-card to-card/80 rounded-xl border border-border hover:border-teal-400/50 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl shadow-teal-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {dict?.home?.feature6Title || "Flexible Pricing"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature6Subtitle ||
                "Start with free plan, upgrade on demand"}
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-muted/50 to-muted/30 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-muted-foreground">
            {dict?.home?.checkout || "Need help? Check out our"}{" "}
            <Link
              href={`/${lang}/documentation`}
              className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
            >
              {dict?.home?.documentation || "Documentation"}
            </Link>{" "}
            {dict?.home?.faq && "& "}
            <Link
              href={`/${lang}/faq`}
              className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
            >
              {dict?.home?.faq || "FAQ"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
