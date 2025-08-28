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
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{dict.contact.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{dict.contact.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="subject" className="mb-1 text-sm font-medium text-gray-700">
              {dict.contact.subject}
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="message" className="mb-1 text-sm font-medium text-gray-700">
              {dict.contact.message}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-4">
            <OnceButton
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              {isSubmitting ? dict.contact.sending : dict.contact.send}
            </OnceButton>
          </div>

          {submitStatus === "success" && (
            <p className="mt-2 text-center text-green-600">{dict.contact.success}</p>
          )}
          {submitStatus === "error" && (
            <p className="mt-2 text-center text-red-600">{dict.contact.error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
