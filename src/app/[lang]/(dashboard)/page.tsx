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

export default async function HomePage(props: PageProps<"/[lang]">) {
  const session = await auth();
  let userName = session?.user?.name || session?.user?.email || "User";
  let userAvatar = session?.user?.image;
  let userEmail = session?.user?.email;
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-4 py-8">
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
          <p className="text-muted-foreground mt-2 text-center">{userEmail}</p>
        )}

        <div className="mt-6 px-4 py-2 bg-primary/10 rounded-full">
          <p className="text-sm font-medium text-primary">Free Plan</p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to FlexiProxy</CardTitle>
          <CardDescription className="text-base mt-2">
            Your gateway to OpenAI-compatible API services
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
            <p className="text-muted-foreground text-sm">
              High-performance proxy with low latency and 99.9% uptime
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure</h3>
            <p className="text-muted-foreground text-sm">
              Enterprise-grade security with end-to-end encryption
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Integration</h3>
            <p className="text-muted-foreground text-sm">
              Simple setup with OpenAI-compatible endpoints
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Need help? Check out our <a href="#" className="text-primary hover:underline">Documentation</a> or <a href="#" className="text-primary hover:underline">Contact Support</a></p>
      </div>
    </section>
  );
}
