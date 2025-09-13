"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackToManagementButton({ dict }: { dict: any }) {
    const router = useRouter();
    return (
        <div className="p-6">
            <Button
                onClick={() => {
                    router.push("/management");
                }}
                className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring max-w-full"
            >
                {dict?.management?.back || "Back to Management"}
            </Button>
        </div>
    );
}
