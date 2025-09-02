"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
interface ProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    provider: string;
    baseUrl: string;
    authToken: string;
  }) => void;
  dict: any;
}

export default function ProxyModal({
  isOpen,
  onClose,
  onSubmit,
  dict,
}: ProxyModalProps) {
  const [provider, setProvider] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [authToken, setAuthToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ provider, baseUrl, authToken });
    // Reset form
    setProvider("");
    setBaseUrl("");
    setAuthToken("");
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-card border border-border shadow-lg p-6 focus:outline-none z-50">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {dict.proxy?.addProvider || "Add Provider"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1 rounded-md hover:bg-muted transition"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label
                htmlFor="provider"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                {dict.proxy?.providerName || "Provider Name"}
              </label>
              <input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full rounded-lg border border-input px-3 py-2 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label
                htmlFor="baseUrl"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                {dict.proxy?.baseUrl || "Base URL"}
              </label>
              <input
                type="url"
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full rounded-lg border border-input px-3 py-2 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label
                htmlFor="authToken"
                className="block text-sm font-medium text-muted-foreground mb-1"
              >
                {dict.proxy?.authToken || "Auth Token"}
              </label>
              <input
                type="text"
                id="authToken"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="w-full rounded-lg border border-input px-3 py-2 text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition"
                >
                  {dict.proxy?.cancel || "Cancel"}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition"
              >
                {dict.proxy?.add || "Add"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
