import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "i18n-config";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HelpCircleIcon } from "lucide-react";
import { OnceButton } from "@/components/ui/oncebutton";
import { createAdapter, getAllTargetProviders } from "@/lib/actions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ManagementConfPage(
  props: PageProps<"/[lang]/managementconf">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  const providers: { id: string; url: string }[] =
    await getAllTargetProviders();
  return (
    <section className="w-full max-w-4xl mx-auto px-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict?.management?.adapterTitle || "Create Adapter"}
          </CardTitle>
          <CardDescription className="text-base">
            {dict?.management?.adapterSubtitle ||
              "Obtain a Base URL adapted to the Target Provider API"}
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
