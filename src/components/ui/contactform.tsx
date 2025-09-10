"use client";

import { useState } from "react";
import { OnceButton } from "@/components/ui/oncebutton";
import { useAsyncFn } from "@/hooks/useAsyncFn";

export function ContactForm({
  dict,
}: {
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
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const { execute: submitContact, loading: isSubmitting } = useAsyncFn<
    boolean,
    [string, string]
  >(
    // exec
    async (subject: string, message: string) => {
      const { token, error } = await sign(undefined, 30);
      if (token !== undefined) {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subject, message }),
        });
        return response.ok;
      } else {
        console.error;
        return false;
      }
    },
    // onComplete
    (result?: boolean) => {
      if (!!result) {
        setSubmitStatus("success");
        setSubject("");
        setMessage("");
      } else {
        setSubmitStatus("error");
      }
    },
    // onPrepare
    () => {
      setSubmitStatus(null);
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContact(subject, message);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col">
          <label
            htmlFor="subject"
            className="mb-2 text-sm font-medium text-muted-foreground"
          >
            {dict.contact.subject}
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-lg border border-input px-4 py-3 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="message"
            className="mb-2 text-sm font-medium text-muted-foreground"
          >
            {dict.contact.message}
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="rounded-lg border border-input px-4 py-3 text-card-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm bg-card"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col">
        <OnceButton
          type="submit"
          className="rounded-lg bg-primary text-primary-foreground px-6 py-3 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ring"
        >
          {isSubmitting ? dict.contact.sending : dict.contact.send}
        </OnceButton>

        {submitStatus === "success" && (
          <div className="mt-4 w-full max-w-md mx-auto">
            <div className="rounded-lg bg-green-100 border border-green-400 text-green-700 px-4 py-3 dark:bg-green-900 dark:border-green-700 dark:text-green-100">
              <p className="text-center font-medium">{dict.contact.success}</p>
            </div>
          </div>
        )}
        {submitStatus === "error" && (
          <div className="mt-4 w-full max-w-md mx-auto">
            <div className="rounded-lg bg-red-100 border border-red-400 text-red-700 px-4 py-3 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
              <p className="text-center font-medium">{dict.contact.error}</p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
