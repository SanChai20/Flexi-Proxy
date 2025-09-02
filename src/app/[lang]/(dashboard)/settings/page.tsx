import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SettingsPage(
  props: PageProps<"/[lang]/settings">
) {
  const session = await auth();
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="w-full max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.settings.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.settings.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </section>
  );
}
