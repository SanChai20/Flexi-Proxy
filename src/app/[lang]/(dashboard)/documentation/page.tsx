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
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{dict.documentation.title}</CardTitle>
                    <CardDescription className="text-base">
                        {dict.documentation.subtitle}
                    </CardDescription>
                </CardHeader>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{dict.documentation.title}</CardTitle>
                    <CardDescription className="text-base">
                        {dict.documentation.subtitle}
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
