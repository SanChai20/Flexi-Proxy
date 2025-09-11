import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { ContactForm } from "@/components/ui/contactform";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  return (
    <section className="w-full max-w-4xl mx-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.contact.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.contact.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm dict={dict} />
        </CardContent>
      </Card>
    </section>
  );
}
