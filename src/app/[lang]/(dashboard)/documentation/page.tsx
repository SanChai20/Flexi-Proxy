import { getDictionary } from "@/lib/dictionary";
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
import { ContentDisplay } from "@/components/ui/contentdisplay";

export default async function DocumentationPage(
  props: PageProps<"/[lang]/documentation">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  // Read the documentation markdown file
  const docPath = path.join(process.cwd(), dict.documentation.documentationPage);
  const docContent = await fs.readFile(docPath, "utf8");
  return (
    <ContentDisplay
      title={dict.legal.termsTitle}
      subtitle={dict.legal.termsSubtitle}
    >
      <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} children={docContent} />
    </ContentDisplay>
  );
}