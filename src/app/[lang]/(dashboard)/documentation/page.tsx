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
import fs from 'fs';

export default async function DocumentationPage(
  props: PageProps<"/[lang]/documentation">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  // Read the documentation markdown file
  const docPath = path.join(process.cwd(), dict.documentation.documentationPage);
  const docContent = fs.readFileSync(docPath, "utf8");
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict?.documentation?.title || "Documentation"}</CardTitle>
          <CardDescription className="text-base">
            {dict?.documentation?.subtitle || "Guiding you through the configuration process"}
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