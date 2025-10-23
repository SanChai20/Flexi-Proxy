import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "./form";
import { getSettingsAction } from "@/lib/actions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexiProxy - Settings",
};

export default async function SettingsPage(
  props: PageProps<"/[lang]/settings">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  const settings: { cd: boolean } = await getSettingsAction();
  return (
    <section className="w-full max-w-4xl mx-auto overflow-x-auto px-0 select-none">
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
      <SettingsForm dict={dict} defaultSettings={settings} />
    </section>
  );
}
