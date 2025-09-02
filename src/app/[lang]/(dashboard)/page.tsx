import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Locale } from "i18n-config";
import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/get-dictionary";

export default async function HomePage(props: PageProps<"/[lang]">) {
  let session = await auth();
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="w-full max-w-4xl mx-auto p-4">
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
