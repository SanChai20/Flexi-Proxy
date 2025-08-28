"use client";

import { useState } from "react";
import styles from "./contactform.module.css";
import { OnceButton } from "@/components/ui/oncebutton";

export function ContactForm({ 
    userId,
    userName, 
    userEmail,
    dict
} : { 
    userId?: string | null, 
    userName?: string | null, 
    userEmail?: string | null,
    dict: {
        contact: {
            title: string;
            subtitle: string;
            name: string;
            email: string;
            subject: string;
            message: string;
            send: string;
            sending: string;
            success: string;
            error: string;
        }
    }
}) {
    const [subject, setSubject] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch([process.env.BASE_URL, 'api/contact'].join('/'), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userName,
                    userEmail,
                    subject,
                    message,
                }),
            });

            if (response.ok) {
                setSubmitStatus("success");
                setSubject("");
                setMessage("");
            } else {
                setSubmitStatus("error");
            }
        } catch (error) {
            setSubmitStatus("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.contactFormContainer}>
            <div className={styles.contactFormCard}>
                <div className={styles.contactFormHeader}>
                    <h2 className={styles.contactFormTitle}>{dict.contact.title}</h2>
                    <p className={styles.contactFormSubtitle}>{dict.contact.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.contactForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="subject" className={styles.formLabel}>
                            {dict.contact.subject}
                        </label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={styles.formInput}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="message" className={styles.formLabel}>
                            {dict.contact.message}
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className={styles.formTextarea}
                            rows={6}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formActions}>

                        <OnceButton
                            type="submit"
                            className={styles.submitButton}
                        >
                            {isSubmitting ? dict.contact.sending : dict.contact.send}
                        </OnceButton>
                    </div>

                    {submitStatus === "success" && (
                        <div className={`${styles.formMessage} ${styles.formMessageSuccess}`}>
                            {dict.contact.success}
                        </div>
                    )}

                    {submitStatus === "error" && (
                        <div className={`${styles.formMessage} ${styles.formMessageError}`}>
                            {dict.contact.error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}