import { getDictionary } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { decode } from "@/lib/actions";
import ClipboardButton from "@/components/ui/clipboard-button";
import BackToManagementButton from "@/components/managed/back-button";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ManagementKeyPage(
    props: PageProps<"/[lang]/management/key">
) {
    const { lang } = await props.params;
    const dict = await getDictionary(lang as Locale);
    const { token } = await props.searchParams;
    let apiKey: string | undefined = undefined;
    if (token && typeof token === "string") {
        const userId: string | undefined = (await auth())?.user?.id;
        if (userId !== undefined) {
            const response: undefined | { secure: string } = await decode(userId, token);
            apiKey = response?.secure;
        }
    }
    if (!apiKey) {
        console.warn('Api key is invalid.')
        redirect(`/${lang}/management`);
    }
    return (
        <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {dict?.management?.copyKeyTitle || "Your API Key"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {dict?.management?.copyKeySubtitle ||
                            "Make sure to copy and save your API key now."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
                        <div className="flex items-center">
                            <div className="p-6 truncate max-w-[calc(100%-40px)] flex-grow text-muted-foreground">
                                {apiKey || "qoiwuyebzxncblqaoisueuqwrhajnsdkjhxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
                            </div>
                            <ClipboardButton text={apiKey || "qoiwuyebzxncblqaoisueuqwrhajnsdkjhxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"} />
                        </div>
                        {/* Divider between sections */}
                        <div className="border-t border-border"></div>
                        <BackToManagementButton dict={dict} />
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
