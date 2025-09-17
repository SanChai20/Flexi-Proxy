import { getTrans } from "@/lib/dictionary";
import { auth } from "@/auth";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexiProxy - Subscription",
};

export default async function SubscriptionPage(
  props: PageProps<"/[lang]/subscription">
) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.subscription.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.subscription.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </section>
  );
}
