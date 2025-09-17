import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import path from "path";
import { promises as fs } from "fs";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexiProxy - FAQ",
};

export default async function FAQPage(props: PageProps<"/[lang]/faq">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  // Read the faq markdown file
  const docPath = path.join(process.cwd(), "public", dict.faq.faqPage);
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.faq?.title || "Frequently Asked Questions"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.faq?.subtitle ||
              "We've compiled answers to common questions about our service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-6 prose prose-gray dark:prose-invert w-full max-w-full">
        <MarkdownRenderer>{docContent}</MarkdownRenderer>
      </div>
    </section>
  );
}
