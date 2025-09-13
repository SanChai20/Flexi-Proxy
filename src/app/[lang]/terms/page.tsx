import { getDictionary } from "@/lib/dictionary";
import { ContentDisplay } from "@/components/ui/contentdisplay";
import path from "path";
import { promises as fs } from "fs";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Locale } from "i18n-config";

export default async function TermsPage(props: PageProps<"/[lang]/terms">) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang as Locale);
  // Read the terms of service markdown file
  const docPath = path.join(process.cwd(), dictionary.legal.termsPage);
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <ContentDisplay
      title={dictionary.legal.termsTitle}
      subtitle={dictionary.legal.termsSubtitle}
    >
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} children={docContent} />
    </ContentDisplay>
  );
}
