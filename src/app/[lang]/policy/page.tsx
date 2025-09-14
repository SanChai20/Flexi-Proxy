import { getDictionary } from "@/lib/dictionary";
import { ContentDisplay } from "@/components/ui/contentdisplay";
import path from "path";
import { promises as fs } from "fs";
import { Locale } from "i18n-config";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

export default async function PolicyPage(props: PageProps<"/[lang]/policy">) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang as Locale);
  // Read the terms of service markdown file
  const docPath = path.join(process.cwd(), 'public', dictionary.legal.policyPage);
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <ContentDisplay
      title={dictionary.legal.policyTitle}
      subtitle={dictionary.legal.policySubtitle}
    >
      <MarkdownRenderer>{docContent}</MarkdownRenderer>
    </ContentDisplay>
  );
}
