import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import path from "path";
import fs from "fs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexiProxy - Documentation",
};

export default async function DocumentationPage(
  props: PageProps<"/[lang]/documentation">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);

  // Read the documentation markdown file
  const docPath = path.join(
    process.cwd(),
    "public",
    dict.documentation.documentationPage
  );
  const docContent = fs.readFileSync(docPath, "utf8");
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.documentation?.title || "About FlexiProxy"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.documentation?.subtitle ||
              "Learn more about FlexiProxy, its features, and how to use it"}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-6 prose prose-gray dark:prose-invert w-full max-w-full">
        <MarkdownRenderer>{docContent}</MarkdownRenderer>
      </div>
    </section>
  );
}
