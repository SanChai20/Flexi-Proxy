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
    <section className="w-full max-w-6xl mx-auto overflow-x-auto px-4 py-8 select-none">
      {isLoggedIn ? (
        // Logged in view - User Dashboard
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="relative">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center shadow-lg">
                <UserIcon className="w-12 h-12 text-primary/60" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background"></div>
          </div>

          <h1 className="text-3xl font-bold mt-6 text-center">{userName}</h1>

          {userEmail && (
            <p className="text-muted-foreground mt-2 text-center">
              {userEmail}
            </p>
          )}

          <div
            className={`mt-6 px-4 py-2 rounded-full ${
              userPermissions?.adv
                ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10"
                : "bg-primary/10"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                userPermissions?.adv
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  : "text-primary"
              }`}
            >
              {userPermissions?.adv
                ? dict?.home?.pro || "Pro Plan"
                : dict?.home?.free || "Free Plan"}
            </p>
          </div>
        </div>
      ) : (
        // Not logged in view - Product Overview
        <div className="flex flex-col items-center justify-center mb-12">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              FlexiProxy
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {dict?.home?.subtitle ||
                "LLM Service Proxy Gateway, Breaking Regional & Pricing Barriers"}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <Link href={`/${lang}/verification`}>
              <Button size="lg" className="font-semibold shadow-lg">
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
              <Button variant="outline" size="lg" className="font-semibold">
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
        {/* <h2 className="text-3xl font-bold text-center mb-8">
          {dict?.home?.whyChoose || "Why Choose FlexiProxy"}
        </h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
              {dict?.home?.feature1Title || "Unified Interface"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature1Subtitle ||
                "One API to access multiple LLM providers"}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
              {dict?.home?.feature2Title || "Break Barriers"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature2Subtitle ||
                "Overcome regional restrictions and high costs"}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
              {dict?.home?.feature3Title || "Easy to Use"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature3Subtitle ||
                "Compatible with existing AI clients"}
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
              {dict?.home?.feature4Title || "High Performance"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature4Subtitle ||
                "Built on LiteLLM, low latency and high availability"}
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
              {dict?.home?.feature5Title || "Secure & Reliable"}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dict?.home?.feature5Subtitle ||
                "End-to-end encryption, secure API key management"}
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group flex flex-col items-center text-center p-6 bg-gradient-to-br from-card to-card/50 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
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
            <h3 className="text-lg font-semibold mb-2">
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
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted/50 border border-border">
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
              className="text-primary hover:underline font-medium"
            >
              {dict?.home?.documentation || "Documentation"}
            </Link>{" "}
            {dict?.home?.faq && "& "}
            <Link
              href={`/${lang}/faq`}
              className="text-primary hover:underline font-medium"
            >
              {dict?.home?.faq || "FAQ"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
