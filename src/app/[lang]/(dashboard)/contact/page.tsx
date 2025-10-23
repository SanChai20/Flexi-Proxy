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
import { sendContactMessage } from "@/lib/contact";

export const metadata: Metadata = {
  title: "FlexiProxy - Contact Us",
};

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
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
        </CardContent>
      </Card>
    </section>
  );
}
