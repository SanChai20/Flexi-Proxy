import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import path from "path";
import { promises as fs } from "fs";

export default async function FAQPage(props: PageProps<"/[lang]/faq">) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  // Read the faq markdown file
  const docPath = path.join(process.cwd(), dict?.faq?.faqPage || "docs/FAQ.md");
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict?.faq?.title || "Frequently Asked Questions"}</CardTitle>
          <CardDescription className="text-base">
            {dict?.faq?.subtitle || "We've compiled answers to common questions about our service"}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-6 prose prose-gray dark:prose-invert w-full max-w-full">
        <Markdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
        >
          {docContent}
        </Markdown>
      </div>
    </section>
  );
}
