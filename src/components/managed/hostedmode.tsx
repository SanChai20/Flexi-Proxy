"use client";

import { useState } from "react";

interface HostedModeProps {
  dict: any;
}

export default function HostedMode({ dict }: HostedModeProps) {
  const [serviceUrl, setServiceUrl] = useState("");
  const [serviceKey, setServiceKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Hosted Mode settings:", { serviceUrl, serviceKey });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {dict.hostedMode?.title || "Hosted Mode Configuration"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dict.hostedMode?.description || "Connect directly to a hosted service for simplified management and reduced infrastructure overhead."}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="serviceUrl"
            className="block text-sm font-medium text-foreground"
          >
            {dict.hostedMode?.serviceUrl || "Service URL"}
          </label>
          <input
            type="url"
            id="serviceUrl"
            value={serviceUrl}
            onChange={(e) => setServiceUrl(e.target.value)}
            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
            placeholder="https://your-service.com/api"
            required
          />
          <p className="text-xs text-muted-foreground">
            {dict.hostedMode?.serviceUrlHint || "Enter the full URL of your hosted service including protocol (http/https)"}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="serviceKey"
            className="block text-sm font-medium text-foreground"
          >
            {dict.hostedMode?.serviceKey || "Service Key"}
          </label>
          <input
            type="password"
            id="serviceKey"
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value)}
            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
            placeholder="API key or access token"
          />
          <p className="text-xs text-muted-foreground">
            {dict.hostedMode?.serviceKeyHint || "Enter your service key or leave blank if not required"}
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          >
            {dict.hostedMode?.save || "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}