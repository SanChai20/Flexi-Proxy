"use client";

import { useState } from "react";

interface ProxyModeProps {
  dict: any;
}

export default function ProxyMode({ dict }: ProxyModeProps) {
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyAuth, setProxyAuth] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Proxy Mode settings:", { proxyUrl, proxyAuth });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {dict.proxyMode?.title || "Proxy Mode Configuration"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dict.proxyMode?.description || "Configure your proxy settings to route API requests through an intermediary server for enhanced security and control."}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="proxyUrl"
            className="block text-sm font-medium text-foreground"
          >
            {dict.proxyMode?.proxyUrl || "Proxy URL"}
          </label>
          <input
            type="url"
            id="proxyUrl"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
            placeholder="https://your-proxy-server.com"
            required
          />
          <p className="text-xs text-muted-foreground">
            {dict.proxyMode?.proxyUrlHint || "Enter the full URL of your proxy server including protocol (http/https)"}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="proxyAuth"
            className="block text-sm font-medium text-foreground"
          >
            {dict.proxyMode?.proxyAuth || "Proxy Authentication"}
          </label>
          <input
            type="password"
            id="proxyAuth"
            value={proxyAuth}
            onChange={(e) => setProxyAuth(e.target.value)}
            className="w-full px-4 py-2.5 text-foreground bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition"
            placeholder="Bearer token or API key"
          />
          <p className="text-xs text-muted-foreground">
            {dict.proxyMode?.proxyAuthHint || "Enter your authentication token or leave blank if not required"}
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition"
          >
            {dict.proxyMode?.save || "Save Configuration"}
          </button>
        </div>
      </form>
    </div>
  );
}