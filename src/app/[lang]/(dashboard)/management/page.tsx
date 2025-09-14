import { getDictionary } from "@/lib/dictionary";
import { Locale } from "i18n-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteAdapter, getAllUserAdapters } from "@/lib/actions";
import { redirect } from "next/navigation";
import ClipboardButton from "@/components/ui/clipboard-button";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import AddAdapterButton from "@/components/managed/add-button";

export default async function ManagementPage(
  props: PageProps<"/[lang]/management">
) {
  const { lang } = await props.params;
  const dict = await getDictionary(lang as Locale);
  let adapters: {
    provider_id: string;
    provider_url: string;
    base_url: string;
    model_id: string;
    create_time: string;
  }[] = await getAllUserAdapters();
  if (adapters.length <= 0) {
    redirect(`/${lang}/management/create`);
  }
  return (
    <section className="w-full max-w-3xl mx-auto overflow-x-auto px-0">
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.management?.title || "Adapter Management"}
            </CardTitle>
            <AddAdapterButton dict={dict} />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.management?.subtitle ||
              "Adapt the OpenAI-Compatible API to the target provider's API service"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-thumb-muted-foreground/20">
            <table className="w-full min-w-[200px] md:min-w-full">
              {/* ----- Header ----- */}
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.provider || "Provider"}
                  </th>
                  <th className="w-3/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                    {dict?.management?.baseUrl || "Base URL"}
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
                    key={adapter.create_time}
                    className="hover:bg-muted/30 transition-colors duration-150"
                  >
                    <td className="w-1/6 px-2 py-3 text-xs uppercase text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <span className="text-[10px] xs:text-xs md:text-sm">
                        {adapter.provider_id}
                      </span>
                    </td>
                    <td className="w-3/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm sm:text-left">
                      <div className="flex justify-start gap-1 xs:gap-2">
                        <span
                          className="font-mono text-[10px] xs:text-xs text-muted-foreground truncate transition-all duration-300 ease-in-out max-w-[140px] xs:max-w-[140px] sm:max-w-[180px] md:max-w-[240px] lg:max-w-[320px]"
                          title={adapter.provider_url}
                        >
                          {adapter.provider_url}
                        </span>
                        <ClipboardButton text={adapter.provider_url} />
                      </div>
                    </td>
                    {/* Settings 图标 + 下拉菜单 */}
                    <td className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm sm:text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150 md:p-1.5"
                            aria-haspopup="true"
                          >
                            <Cog6ToothIcon className="h-3 w-3 xs:h-4 xs:w-4 md:h-5 md:w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-32 xs:w-36 rounded-lg"
                        >
                          <form
                            action={
                              async (formData) => {
                                "use server";
                                const adapter = formData.get("adapter") as string;
                                const adapterJSON: {
                                  provider_id: string;
                                  provider_url: string;
                                  base_url: string;
                                  model_id: string;
                                  create_time: string;
                                } = JSON.parse(adapter);
                                redirect(
                                  `/${lang}/management/modify?baseUrl=${encodeURIComponent(
                                    adapterJSON.base_url
                                  )}&modelId=${encodeURIComponent(
                                    adapterJSON.model_id
                                  )}&providerId=${encodeURIComponent(
                                    adapterJSON.provider_id
                                  )}&createTime=${encodeURIComponent(
                                    adapterJSON.create_time
                                  )}`
                                );
                              }}
                          >
                            <input
                              type="hidden"
                              name="adapter"
                              value={JSON.stringify(adapter)}
                            />
                            <DropdownMenuItem
                              className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
                              asChild
                            >
                              <button type="submit">
                                {dict?.management?.getApiKey || "Get API Key"}
                              </button>
                            </DropdownMenuItem>
                          </form>
                          <form
                            action={async (formData) => {
                              "use server";
                              const createTime = formData.get("createTime") as string;
                              const result:
                                | { create_time: string }
                                | undefined = await deleteAdapter(createTime);
                              if (result !== undefined) {
                                redirect(`/${lang}/management`); //Refresh
                              }
                            }}
                          >
                            <input
                              type="hidden"
                              name="createTime"
                              value={adapter.create_time}
                            />
                            <DropdownMenuItem
                              className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
                              asChild
                            >
                              <button type="submit">
                                {dict?.management?.delete || "Delete"}
                              </button>
                            </DropdownMenuItem>
                          </form>
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
    </section >
  );
}
