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
    const [subject, setSubject] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

    // async function handleSubmit(formData: FormData) {
    //     try {
    //         setIsSubmitting(true);
    //         setMessage(null);
    //         setSubmitStatus(null);
            
    //         // Send the data to the API endpoint
    //         const response = await fetch([process.env.BASE_URL, 'api/contact'].join('/'), {
    //             method: 'POST',
    //             headers: {
    //                 'user-id': userId,
    //                 'user-name': userName,
    //                 'user-email': userEmail
    //             },
    //             body: formData
    //         });
            
    //         const data = await response.json();
            
    //         if (response.ok) {
    //             setMessage({
    //                 type: 'success',
    //                 text: "Thank you for your message! We have received your information and will get back to you as soon as possible."
    //             });
                
    //             // Reset the form
    //             const form = document.querySelector('form') as HTMLFormElement;
    //             if (form) form.reset();
    //         } else {
    //             // Handle specific error cases
    //             if (response.status === 429) {
    //                 // Rate limit error - only one message per day
    //                 setMessage({
    //                     type: 'error',
    //                     text: data.message || "You can only send one message per day. Please try again tomorrow."
    //                 });
    //             } else {
    //                 // General error
    //                 setMessage({
    //                     type: 'error',
    //                     text: data.message || "Submission failed, please try again later"
    //                 });
    //             }
    //             //console.error("Form submission failed:", data);
    //         }
    //     } catch (err) {
    //         setMessage({
    //             type: 'error',
    //             text: "An error occurred during submission, please try again later"
    //         });
    //         //console.error("Form submission error:", err);
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // }

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
                            disabled={isSubmitting}
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