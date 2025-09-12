import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "i18n-config";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OnceButton } from "@/components/ui/oncebutton";
import { redirect } from "next/navigation";
import { jwtSign } from "@/lib/jwt";

export default async function ManagementModifyPage(
    props: PageProps<"/[lang]/management/modify">
) {
    const { lang } = await props.params;
    const dict = await getDictionary(lang as Locale);
    const { baseUrl, modelId, providerId, createTime } = await props.searchParams;
    if (!baseUrl || !modelId || !providerId || !createTime) {
        redirect(`/${lang}/management`);
    }
    return (
        <section className="w-full max-w-4xl mx-auto px-0">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">
                        {dict?.management?.keyTitle || "API Key Management"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {dict?.management?.keySubtitle ||
                            "Get available API key for target provider"}
                    </CardDescription>
                </CardHeader>
            </Card>
            <form
                action={async (formData) => {
                    "use server";
                    const apiKey = formData.get("apiKey") as string;
                    const { token, error } = await jwtSign({ api_key: apiKey, create_time: createTime }, 3600);
                    if (token !== undefined) {
                        redirect(`/${lang}/management?token=${encodeURIComponent(token)}`);
                    }
                }}
                className="mt-6"
            >
                {/* Adapter Configuration Section */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Source Section (OpenAI-Compatible) */}
                    <div className="p-6">
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                                {dict?.management?.adapterSource || "SOURCE"}
                            </span>
                            <span className="truncate max-w-[200px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px]">
                                {dict?.management?.sourceTitle ||
                                    "Configure OpenAI-Compatible Endpoint"}
                            </span>
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <label
                                            htmlFor="baseUrl"
                                            className="block text-sm font-medium text-foreground"
                                        >
                                            {dict?.management?.baseUrl || "Base URL"}
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        id="baseUrl"
                                        name="baseUrl"
                                        value={baseUrl}
                                        readOnly
                                        className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="apiKey"
                                        className="block text-sm font-medium text-foreground"
                                    >
                                        {dict?.management?.apiKey || "API Key"}
                                    </label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        name="apiKey"
                                        className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                                        placeholder={
                                            dict?.management?.apiKeyPlaceHolder ||
                                            "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        }
                                        required
                                    />
                                </div>

                            </div>
                            <div className="space-y-2">
                                <label
                                    htmlFor="modelId"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    {dict?.management?.modelId || "Model ID"}
                                </label>
                                <input
                                    type="text"
                                    id="modelId"
                                    name="modelId"
                                    value={modelId}
                                    readOnly
                                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider between sections */}
                    <div className="border-t border-border"></div>

                    {/* Target Section (API Provider) */}
                    <div className="p-6">
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                                {dict?.management?.adapterTarget || "TARGET"}
                            </span>
                            <span className="truncate max-w-[200px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] lg:max-w-[320px]">
                                {dict?.management?.targetTitle2 ||
                                    "Selected Target API Provider"}
                            </span>
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label
                                    htmlFor="provider"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    {dict?.management?.provider || "Provider"}
                                </label>
                                <input
                                    type="text"
                                    id="provider"
                                    name="provider"
                                    value={providerId}
                                    readOnly
                                    className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition cursor-not-allowed opacity-75"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Divider between sections */}
                    <div className="border-t border-border"></div>

                    {/* Submit Button */}
                    <div className="p-6">
                        <OnceButton
                            type="submit"
                            className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring max-w-full"
                        >
                            {dict?.management?.confirm || "Confirm"}
                        </OnceButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
