"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { PROVIDER_OPTIONS } from "@/components/managed/table";
import ProxyMode from "@/components/managed/proxymode";
import HostedMode from "@/components/managed/hostedmode";

interface ProxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    provider: string;
    baseUrl: string;
    authToken: string;
  }) => void;
  dict: any;
  mode: "proxy" | "hosted";
  onModeChange: (mode: "proxy" | "hosted") => void;
}

export default function ManagedModal({
  isOpen,
  onClose,
  onSubmit,
  dict,
  mode,
  onModeChange,
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
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-lg bg-card border border-border shadow-lg focus:outline-none z-50 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-border p-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              {dict.proxy?.addProvider || "Add Provider"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-full hover:bg-muted transition"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {mode === "proxy"
                      ? dict.proxyMode?.title || "Proxy Mode"
                      : dict.hostedMode?.title || "Hosted Mode"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mode === "proxy"
                      ? dict.proxyMode?.description ||
                        "Route requests through a proxy server"
                      : dict.hostedMode?.description ||
                        "Connect directly to a hosted service"}
                  </p>
                </div>

                <div className="flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      mode === "proxy"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dict.mode?.proxy || "Proxy"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onModeChange(mode === "proxy" ? "hosted" : "proxy")
                    }
                    className="mx-3 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-muted-foreground/30"
                    aria-pressed={mode === "hosted"}
                  >
                    <span className="sr-only">
                      {dict.mode?.switchMode || "Switch mode"}
                    </span>
                    <span
                      className={`${
                        mode === "hosted" ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      mode === "hosted"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {dict.mode?.hosted || "Hosted"}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                {mode === "proxy" ? (
                  <ProxyMode dict={dict} />
                ) : (
                  <HostedMode dict={dict} />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 pt-0">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition"
              >
                {dict.proxy?.cancel || "Cancel"}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
