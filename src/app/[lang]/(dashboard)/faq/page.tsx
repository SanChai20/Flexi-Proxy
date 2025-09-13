import { getDictionary } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import path from "path";
import { promises as fs } from "fs";

export default async function FAQPage(props: PageProps<"/[lang]/faq">) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  // Read the faq markdown file
  const docPath = path.join(process.cwd(), 'public', dict.faq.faqPage);
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
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
