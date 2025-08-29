import { getDictionary } from "@/lib/get-dictionary";
import { auth } from "@/auth";
import { ContactForm } from "@/components/ui/contactform";
import { Locale } from "i18n-config";

export default async function ContactPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
    const session = await auth();
    const { lang } = await props.params;
    const dictionary = await getDictionary(lang)
    return <ContactForm  
        userId={session?.user?.id}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        dict={dictionary}
    />;
}