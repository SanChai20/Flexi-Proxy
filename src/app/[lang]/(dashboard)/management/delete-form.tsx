"use client";

import { deleteAdapterAction } from "@/lib/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function DeleteAdapterForm({
  dict,
  create_time,
}: {
  dict: any;
  create_time: string;
}) {
  const router = useRouter();
  async function onSubmit(formData: FormData) {
    const redirectTo = await deleteAdapterAction(formData);
    if (redirectTo !== undefined) {
      router.push(redirectTo);
    }
  }
  return (
    <form action={onSubmit}>
      <input type="hidden" name="createTime" value={create_time} />
      <DropdownMenuItem
        className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
        asChild
      >
        <button type="submit" className="w-full">
          {dict?.management?.delete || "Delete"}
        </button>
      </DropdownMenuItem>
    </form>
  );
}
