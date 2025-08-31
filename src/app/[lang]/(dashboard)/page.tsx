import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { File, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Locale } from "i18n-config";
import { auth } from "@/auth";






export default async function HomePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  let session = await auth();





  return (
    <Tabs defaultValue="all">
      <div className="flex items-center"></div>
    </Tabs>
  );
}
