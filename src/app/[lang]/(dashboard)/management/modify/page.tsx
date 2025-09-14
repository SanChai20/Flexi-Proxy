import { getDictionary } from "@/lib/dictionary";
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
import { encode } from "@/lib/actions";
import { auth } from "@/auth";

export default async function ManagementModifyPage(
    props: PageProps<"/[lang]/management/modify">
) {
    const { lang } = await props.params;
    const dict = await getDictionary(lang as Locale);
    const params = await props.searchParams;
    if (!params || !params.baseUrl || !params.modelId || !params.providerId || !params.createTime) {
        redirect(`/${lang}/management`);
    }
    return (
        <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
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
                    const session = await auth();
                    if (!!(session && session.user && session.user.id)) {
                        const { token, error } = await jwtSign({
                            uid: session.user.id,
                            ak: apiKey,
                            bu: params.baseUrl,
                            mid: params.modelId
                        });
                        if (token !== undefined) {
                            const tempToken: undefined | { token: string } = await encode(session.user.id, token);
                            if (tempToken !== undefined) {
                                redirect(`/${lang}/management/key?token=${encodeURIComponent(tempToken.token)}`);
                            }
                        }
                    }
                }}
                className="mt-6"
            >
                {/* Adapter Configuration Section */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Source Section (OpenAI-Compatible) */}
                    <div className="p-6">
                        <h3 className="text-md font-semibold text-foreground mb-4 flex items-center w-full">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
                                {dict?.management?.adapterSource || "SOURCE"}
                            </span>
                            <span className="truncate">
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
                                        value={params.baseUrl}
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
                                    value={params.modelId}
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
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2 flex-shrink-0">
                                {dict?.management?.adapterTarget || "TARGET"}
                            </span>
                            <span className="truncate">
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
                                    value={params.providerId}
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
