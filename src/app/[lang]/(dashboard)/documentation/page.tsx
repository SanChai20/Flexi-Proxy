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

export default async function DocumentationPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const session = await auth();
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{dict.contact.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.contact.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent></CardContent>
      </Card>
    </div>
  );
}
