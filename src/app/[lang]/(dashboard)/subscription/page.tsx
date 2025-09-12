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

export default async function SubscriptionPage(
  props: PageProps<"/[lang]/subscription">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="w-full max-w-4xl mx-auto px-0">
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
