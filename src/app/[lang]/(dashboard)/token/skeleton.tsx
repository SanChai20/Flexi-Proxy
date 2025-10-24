import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccessTokenSkeleton({ dict }: { dict: any }) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.token?.title || "Token Pass Management"}
            </CardTitle>
            <Skeleton className="h-10 w-24" />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.token?.subtitle ||
              "Managing Token Pass of LLM Proxy Services"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="border border-border bg-card rounded-xl overflow-hidden shadow-md">
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent        
scrollbar-thumb-muted-foreground/30"
          >
            <table className="w-full min-w-[200px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="w-[12%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.proxy || "Proxy Gateway"}
                  </th>
                  <th className="w-[32%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.baseUrl || "Base URL"}
                  </th>
                  <th className="w-[8%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.tokenPass || "Token Pass (API Key)"}
                  </th>
                  <th className="w-[34%] px-3 py-3 text-left sm:px-5 sm:py-4">
                    {dict?.token?.note || "Note"}
                  </th>
                  <th className="w-[14%] px-3 py-3 text-right sm:px-5 sm:py-4">
                    {dict?.token?.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                  <tr
                    key={i}
                    className="hover:bg-muted/20 transition-colors duration-200"
                  >
                    <td className="w-[12%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm text-left">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="w-[32%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="w-[8%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="w-[34%] px-3 py-3 sm:px-5 sm:py-3.5 text-sm">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="w-[14%] px-3 py-3 text-sm text-right sm:px-5 sm:py-3.5">
                      <Skeleton className="h-5 w-5 ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
