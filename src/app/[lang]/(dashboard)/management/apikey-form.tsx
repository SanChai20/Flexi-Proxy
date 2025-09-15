"use client";

import { getAPIKeyAction } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function GetAPIKeyForm({ dict, adapter }: { dict: any; adapter: {} }) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    const redirectTo = await getAPIKeyAction(formData);
    if (redirectTo !== undefined) {
      router.push(redirectTo);
    }
  }
  return (
    <form action={onSubmit}>
      <input type="hidden" name="adapter" value={JSON.stringify(adapter)} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full">
          {dict?.management?.getApiKey || "Get API Key"}
        </button>
      </DropdownMenuItem>
    </form>
  );
}
