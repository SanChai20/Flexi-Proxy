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

export default async function ContactPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const session = await auth();
  const { lang } = await props.params;
  const dict = await getDictionary(lang);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.contact.title}</CardTitle>
          <CardDescription className="text-base">
            {dict.contact.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm
            userId={session?.user?.id}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
            dict={dict}
          />
        </CardContent>
      </Card>
    </div>
  );
}
