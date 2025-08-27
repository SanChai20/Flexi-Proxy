"use client";

import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";
import styles from "@/components/ui/oncebutton.module.css";
import { LoadingIcon } from "@/components/ui/icons";

export function OnceButton({
    children,
    className,
    type = "submit",
    coolDown = 8000,
    ...props
}: {
    children: any;
    className?: string;
    type?: "submit" | "button";
    coolDown?: number;
}) {
    const { pending } = useFormStatus();
    const [wasPending, setWasPending] = useState(false);

    useEffect(() => {
        if (pending) setWasPending(true);
        if (!pending && wasPending) {
            const timer = setTimeout(() => setWasPending(false), coolDown);
            return () => clearTimeout(timer);
        }
    }, [pending, wasPending, coolDown]);

    const isDisabled = pending || wasPending;

    return (
        <button
            type={type}
            className={className}
            disabled={isDisabled}
            {...props}
        >
            {isDisabled ? (
                <span className={styles.buttonLoading}>
                    <LoadingIcon />
                    {children}
                </span>
            ) : (
                children
            )}
        </button>
    );
}