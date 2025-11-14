import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnceButton } from "@/components/ui/oncebutton";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { sendContactMessage, getAdminEmail } from "@/lib/contact";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "FlexiProxy - Contact Us",
};

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  const adminEmail = await getAdminEmail();

  return (
    <section className="w-full max-w-5xl mx-auto overflow-x-auto px-0 select-none">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.contact?.title || "Contact Us"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.contact?.subtitle ||
              "Have questions or feedback? We'd love to hear from you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              "use server";
              const subject = formData.get("subject") as string;
              const message = formData.get("message") as string;
              const result: { message: string; success: boolean } =
                await sendContactMessage(subject, message);
              redirect(
                `/${lang}/contact/feedback?success=${encodeURIComponent(
                  result.success
                )}&message=${encodeURIComponent(result.message)}`
              );
            }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex flex-col">
                <label
                  htmlFor="subject"
                  className="mb-2 text-sm font-medium text-muted-foreground"
                >
                  {dict?.contact?.subject || "Subject"}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="rounded-lg border border-input px-4 py-3 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="message"
                  className="mb-2 text-sm font-medium text-muted-foreground"
                >
                  {dict?.contact?.message || "Message"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={8}
                  className="rounded-lg border border-input px-4 py-3 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <OnceButton
                type="submit"
                className="rounded-lg bg-primary text-primary-foreground px-6 py-3 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
              >
                {dict?.contact?.send || "Send"}
              </OnceButton>
            </div>
          </form>

          {adminEmail && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    {dict?.contact?.officialEmail || "Official Email"}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-input bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  {dict?.contact?.emailDescription ||
                    "You can also send an email directly to our official email:"}
                </p>
                <a
                  href={`mailto:${adminEmail}`}
                  className="flex items-center gap-2 text-base font-medium text-primary hover:underline"
                >
                  <Mail className="h-5 w-5" />
                  {adminEmail}
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
