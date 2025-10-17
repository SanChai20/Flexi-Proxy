import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ManagementSkeleton({ dict }: { dict: any }) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">
              {dict?.management?.title || "Token Pass Management"}
            </CardTitle>
            <Skeleton className="h-10 w-24" />
          </div>
          <CardDescription className="text-base mt-2">
            {dict?.management?.subtitle ||
              "Managing Token Pass of LLM Proxy Services"}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="mt-6">
        <div className="border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[200px] md:min-w-full">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.proxy || "Proxy Gateway"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.baseUrl || "Base URL"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.tokenPass || "Token Pass"}
                  </th>
                  <th className="w-2/6 px-2 py-3 text-xs text-left sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.note || "Note"}
                  </th>
                  <th className="w-1/6 px-2 py-3 text-xs text-right sm:px-5 sm:py-3.5 sm:text-sm">
                    {dict?.management?.actions || "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[...Array(3)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-2 py-3 sm:px-5 sm:py-3.5">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-2 py-3 sm:px-5 sm:py-3.5">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-2 py-3 sm:px-5 sm:py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-2 py-3 sm:px-5 sm:py-3.5">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-2 py-3 sm:px-5 sm:py-3.5 text-right">
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
