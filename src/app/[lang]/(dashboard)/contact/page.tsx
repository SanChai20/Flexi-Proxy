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
    <>
      <Card>
        <CardHeader>
          <CardTitle>{dict.contact.title}</CardTitle>
          <CardDescription>{dict.contact.subtitle}</CardDescription>
        </CardHeader>
        {/* <CardContent> asd</CardContent> */}
      </Card>
      <ContactForm
        userId={session?.user?.id}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        dict={dict}
      />
    </>
  );
}
