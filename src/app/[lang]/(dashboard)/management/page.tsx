import { getTrans } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createShortTimeToken,
  getAllUserAdapters,
  getCachedUserPermissions,
} from "@/lib/actions";
import { redirect } from "next/navigation";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Settings } from "lucide-react";
import {
  CreateAdapterForm,
  DeleteAdapterDropdownForm,
  EditAdapterDropdownForm,
} from "./form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlexiProxy - Token Pass Management",
};

export default async function ManagementPage(
  props: PageProps<"/[lang]/management">
) {
  const { lang } = await props.params;
  const [dict, permissions, adapters] = await Promise.all([
    getTrans(lang as Locale),
    getCachedUserPermissions(),
    getAllUserAdapters(),
  ]);
  if (!adapters || adapters.length === 0) {
    const token = await createShortTimeToken(3600);
    redirect(`/${lang}/management/create?token=${encodeURIComponent(token)}`);
  }
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.management?.title || "Token Pass Management"}
            </CardTitle>
            <CreateAdapterForm
              dict={dict}
              currentAdapterCount={adapters.length}
              maxAdapterCountAllowed={permissions.maa}
            />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.management?.subtitle ||
              "Managing Token Pass of LLM Proxy Services"}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="mt-6">
        <div className="border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            <table className="w-full min-w-[200px] md:min-w-full">
              {/* ----- Header ----- */}
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.proxy || "Proxy Gateway"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.baseUrl || "Base URL"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.tokenPass || "Token Pass (API Key)"}
                  </th>
                  <th className="w-2/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.note || "Note"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm sm:text-right">
                    {dict?.management?.actions || "Actions"}
                  </th>
                </tr>
              </thead>

              {/* ----- Body ----- */}
              <tbody className="divide-y divide-border">
                {adapters.map((adapter, index) => (
                  <tr
                    key={adapter.aid}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <span className="text-[10px] xs:text-xs md:text-sm whitespace-nowrap">
                        {adapter.pid}
                        {adapter.ava
                          ? ""
                          : " (" + dict?.management?.unavailable + ")"}
                      </span>
                    </td>
                    <td className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <div className="flex justify-start gap-1 xs:gap-2">
                        <span
                          className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap truncate transition-all duration-300 ease-in-out max-w-[140px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[240px]"
                          title={adapter.pul}
                        >
                          {adapter.pul}
                        </span>
                        <ClipboardButton text={adapter.pul} />
                      </div>
                    </td>
                    <td className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <div className="flex justify-start gap-1 xs:gap-2">
                        <span
                          className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap truncate transition-all duration-300 ease-in-out max-w-[80px] xs:max-w-[80px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[180px]"
                          title={adapter.tk}
                        >
                          {adapter.tk}
                        </span>
                        <ClipboardButton text={adapter.tk} />
                      </div>
                    </td>
                    <td className="w-2/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <span className="font-mono text-[10px] xs:text-xs md:text-sm text-muted-foreground whitespace-nowrap transition-all duration-300 ease-in-out max-w-[140px] xs:max-w-[120px] sm:max-w-[140px] md:max-w-[180px] lg:max-w-[240px]">
                        {adapter.not}
                      </span>
                    </td>
                    {/* Settings 图标 + 下拉菜单 */}
                    <td className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm sm:text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 md:p-1.5">
                          <Settings className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-32 xs:w-36 rounded-lg"
                        >
                          <EditAdapterDropdownForm
                            dict={dict}
                            adapter_id={adapter.aid}
                          />
                          <DeleteAdapterDropdownForm
                            dict={dict}
                            adapter_id={adapter.aid}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
