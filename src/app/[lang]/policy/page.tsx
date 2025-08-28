import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/lib/get-dictionary";
import { ContentDisplay } from "@/components/ui/contentdisplay";

export default async function PolicyPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  
  return (
    <ContentDisplay 
      title={dictionary.policy.title}
      subtitle={dictionary.policy.subtitle}
    >
      <div dangerouslySetInnerHTML={{ __html: dictionary.policy.content }} />
    </ContentDisplay>
  );
}