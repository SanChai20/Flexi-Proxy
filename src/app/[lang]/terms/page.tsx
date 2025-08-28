import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/utils/get-dictionary";
import { ContentDisplay } from "@/components/ui/contentdisplay";

export default async function TermsPage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang);
  
  return (
    <ContentDisplay 
      title={dictionary.terms.title}
      subtitle={dictionary.terms.subtitle}
    >
      <div dangerouslySetInnerHTML={{ __html: dictionary.terms.content }} />
    </ContentDisplay>
  );
}