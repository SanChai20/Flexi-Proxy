"use client";

import { Button } from "@/components/ui/button";
import { getAPIKeyAction } from "@/lib/actions";
import { useActionState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CreateState = {
    adapter?: string;
};

export function GetAPIKeyForm({ dict, adapter }: { dict: any; adapter: {}; }) {
    const [state, action, isPending] = useActionState<CreateState, FormData>(
        getAPIKeyAction,
        {}
    );
    return (
        <form
            action={action}
        >
            <input
                type="hidden"
                name="adapter"
                defaultValue={state?.adapter}
                value={JSON.stringify(adapter)}
            />
            <DropdownMenuItem
                className="w-full cursor-pointer text-destructive focus:text-destructive text-xs xs:text-sm"
                asChild
            >
                <button type="submit" className="w-full" disabled={isPending}>
                    {dict?.management?.getApiKey || "Get API Key"}
                </button>
            </DropdownMenuItem>
        </form>
    );
}
