"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon, PlusIcon, TrashIcon } from "lucide-react";
import { PROVIDER_OPTIONS } from "@/components/managed/table";

interface Header {
  key: string;
  value: string;
}

interface AdapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    modelId: string;
    headers: Header[];
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
}: AdapterModalProps) {
  const [provider, setProvider] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState("");
  const [headers, setHeaders] = useState<Header[]>([{ key: "", value: "" }]);

  const handleAddHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const handleRemoveHeader = (index: number) => {
    if (headers.length <= 1) return;
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const handleHeaderChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ provider, baseUrl, apiKey, modelId, headers });
    // Reset form
    setProvider("");
    setBaseUrl("");
    setApiKey("");
    setModelId("");
    setHeaders([{ key: "", value: "" }]);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[95vw] max-w-2xl translate-x-[-50%] translate-y-[-50%] rounded-lg bg-card border border-border shadow-lg focus:outline-none z-50 flex flex-col">
          <div className="flex flex-col space-y-1 pb-4 border-b border-border p-6">
            <Dialog.Title className="text-xl font-bold text-foreground">
              {dict.management.adapterTitle}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {dict.management.adapterSubtitle}
            </Dialog.Description>
          </div>
          <div className="absolute top-6 right-6">
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
              <div className="pt-2">
                <div className="space-y-6">
                  {/* Source Section (OpenAI-Compatible) */}
                  <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                        SOURCE
                      </span>
                      {dict.adapter?.sourceTitle ||
                        "OpenAI-Compatible Endpoint"}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="baseUrl"
                            className="block text-sm font-medium text-foreground"
                          >
                            {dict.adapter?.baseUrl || "Base URL"}
                          </label>
                          <input
                            type="url"
                            id="baseUrl"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                            placeholder="https://api.openai.com/v1"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="apiKey"
                            className="block text-sm font-medium text-foreground"
                          >
                            {dict.adapter?.apiKey || "API Key"}
                          </label>
                          <input
                            type="password"
                            id="apiKey"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="modelId"
                          className="block text-sm font-medium text-foreground"
                        >
                          {dict.adapter?.modelId || "Model ID"}
                        </label>
                        <input
                          type="text"
                          id="modelId"
                          value={modelId}
                          onChange={(e) => setModelId(e.target.value)}
                          className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                          placeholder="gpt-3.5-turbo"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-foreground">
                            {dict.adapter?.customHeaders || "Custom Headers"}
                          </label>
                          <button
                            type="button"
                            onClick={handleAddHeader}
                            className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            {dict.adapter?.addHeader || "Add"}
                          </button>
                        </div>

                        {headers.map((header, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={header.key}
                              onChange={(e) =>
                                handleHeaderChange(index, "key", e.target.value)
                              }
                              className="flex-1 px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                              placeholder="Header Key"
                            />
                            <input
                              type="text"
                              value={header.value}
                              onChange={(e) =>
                                handleHeaderChange(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                              placeholder="Header Value"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveHeader(index)}
                              className="p-2.5 text-muted-foreground hover:text-destructive transition"
                              disabled={headers.length <= 1}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Target Section (API Provider) */}
                  <div className="bg-card border border-border rounded-lg p-6 mb-6">
                    <h3 className="text-md font-semibold text-foreground mb-4 flex items-center">
                      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded mr-2">
                        TARGET
                      </span>
                      {dict.adapter?.targetTitle || "Target API Provider"}
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="provider"
                          className="block text-sm font-medium text-foreground"
                        >
                          {dict.adapter?.provider || "Provider"}
                        </label>
                        <select
                          id="provider"
                          value={provider}
                          onChange={(e) => setProvider(e.target.value)}
                          className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
                          required
                        >
                          <option value="">
                            {dict.adapter?.selectProvider ||
                              "Select a provider"}
                          </option>
                          {PROVIDER_OPTIONS.map((option) => (
                            <option key={option.id} value={option.name}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
                    >
                      {dict.adapter?.save || "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
