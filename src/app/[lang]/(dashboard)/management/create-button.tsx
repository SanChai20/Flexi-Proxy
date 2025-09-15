"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateAdapterButton({ dict }: { dict: any }) {
  const router = useRouter();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              router.push("/management/create");
            }}
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full sm:h-9 sm:w-9"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="sr-only">
              {dict?.management?.adapterAdd || "Add Adapter"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{dict?.management?.adapterAdd || "Add Adapter"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
