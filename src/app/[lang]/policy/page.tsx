import { getDictionary } from "@/lib/get-dictionary";
import { ContentDisplay } from "@/components/ui/contentdisplay";
import path from "path";
import { promises as fs } from "fs";
import Markdown from "react-markdown";
import { Locale } from "i18n-config";

export default async function PolicyPage(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang as Locale);
  // Read the terms of service markdown file
  const termsPath = path.join(process.cwd(), dictionary.legal.policyPage);
  const termsContent = await fs.readFile(termsPath, "utf8");
  return (
    <ContentDisplay
      title={dictionary.legal.policyTitle}
      subtitle={dictionary.legal.policySubtitle}
    >
      <Markdown children={termsContent} />
    </ContentDisplay>
  );
}
