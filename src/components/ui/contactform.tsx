"use client";

import { useState } from "react";
import { OnceButton } from "@/components/ui/oncebutton";

export function ContactForm({
  userId,
  userName,
  userEmail,
  dict,
}: {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
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
    };
  };
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
      const response = await fetch([process.env.BASE_URL, "api/contact"].join("/"), {
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
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-md border border-border">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-card-foreground">{dict.contact.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{dict.contact.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="subject" className="mb-1 text-sm font-medium text-muted-foreground">
              {dict.contact.subject}
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-input px-3 py-2 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="message" className="mb-1 text-sm font-medium text-muted-foreground">
              {dict.contact.message}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="rounded-lg border border-input px-3 py-2 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-4">
            <OnceButton
              type="submit"
              className="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
            >
              {isSubmitting ? dict.contact.sending : dict.contact.send}
            </OnceButton>
          </div>

          {submitStatus === "success" && (
            <p className="mt-2 text-center text-destructive-foreground bg-destructive rounded px-2 py-1">
              {dict.contact.success}
            </p>
          )}
          {submitStatus === "error" && (
            <p className="mt-2 text-center text-destructive-foreground bg-destructive rounded px-2 py-1">
              {dict.contact.error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
