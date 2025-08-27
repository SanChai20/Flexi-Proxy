"use client";

import styles from "@/components/ui/unauthorized.module.css";
import { LockIcon } from "@/components/ui/icons";
import { redirect } from "next/navigation";

export default function Unauthorized({ 
    dict 
}: { 
    dict: { 
        unauthorized: { 
            title: string, 
            subtitle: string, 
            description: string,
            retry: string
        } 
    };
}) {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.iconContainer}>
                    <div className={styles.lockIcon}>
                        <LockIcon />
                    </div>
                </div>
                
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>{dict.unauthorized.title}</h1>
                    <p className={styles.subtitle}>
                        {dict.unauthorized.subtitle}
                    </p>
                    <p className={styles.description}>
                        {dict.unauthorized.description}
                    </p>
                </div>

                <div className={styles.buttonContainer}>
                    <button
                        onClick={() => redirect("/login")}
                        className={styles.homeButton}
                    >
                        {dict.unauthorized.retry}
                    </button>
                </div>
            </div>
        </div>
    );
}
