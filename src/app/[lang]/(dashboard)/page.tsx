import { Locale } from "i18n-config";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTrans } from "@/lib/dictionary";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const dict = await getTrans(lang as Locale);
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.home.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.home.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </section>
  );
}
