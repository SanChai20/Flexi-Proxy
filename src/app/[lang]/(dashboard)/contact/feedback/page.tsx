import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "i18n-config";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";


export default async function ContactFeedbackPage(props: PageProps<"/[lang]/contact/feedback">) {
    const { lang } = await props.params;
    const dict = await getDictionary(lang as Locale);
    const searchParams = await props.searchParams;
    const success = searchParams.success === 'true';
    const message = searchParams.message || '';

    return (
        <section className="w-full max-w-4xl mx-auto px-0">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{dict?.contact?.title || "Contact Us"}</CardTitle>
                    <CardDescription className="text-base">
                        {dict?.contact?.subtitle || "Have questions or feedback? We'd love to hear from you."}
                    </CardDescription>
                </CardHeader>
            </Card>
            <div className="flex flex-col items-center justify-center py-16">
                <div className={`flex flex-col items-center justify-center rounded-full w-16 h-16 ${success
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                    }`}>
                    {success ? (
                        <Check className="w-8 h-8 text-green-600 dark:text-green-300" />
                    ) : (
                        <X className="w-8 h-8 text-red-600 dark:text-red-300" />
                    )}
                </div>
                <h3 className={`mt-6 text-2xl font-semibold ${success
                    ? "text-green-600 dark:text-green-300"
                    : "text-red-600 dark:text-red-300"
                    }`}>
                    {success
                        ? (dict?.contact?.success || "Success!")
                        : (dict?.contact?.error || "Error!")}
                </h3>
                {
                    message && <p className="mt-2 text-center text-muted-foreground max-w-md">{message}</p>
                }
            </div>
        </section>
    );
}