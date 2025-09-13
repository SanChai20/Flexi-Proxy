import { getDictionary } from "@/lib/dictionary";
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
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);

  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.settings?.title || "Settings"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.settings?.subtitle ||
              "Configure your account and preferences"}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-6">
        {/* <LanguageSwitcher dict={dict}></LanguageSwitcher>
        <ThemeSwitcher dict={dict} /> */}
      </div>
    </section >
  );
}