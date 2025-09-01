"use client";

import { Button } from "@/components/ui/button";
import { 
  CogIcon,
  CopyIcon
} from "@/components/ui/icons";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface ProxyItemProps {
  provider: string;
  baseUrl: string;
  authToken: string;
  status: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProxyItem({ 
  provider, 
  baseUrl, 
  authToken, 
  status, 
  onEdit, 
  onDelete 
}: ProxyItemProps) {
  const [baseUrlCopied, setBaseUrlCopied] = useState(false);
  const [authTokenCopied, setAuthTokenCopied] = useState(false);

  const copyToClipboard = (text: string, setCopied: (value: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="grid grid-cols-4 gap-4 flex-1">
        <div className="font-medium flex items-center">
          {provider}
        </div>
        <div className="text-muted-foreground flex items-center">
          <span className="truncate mr-2">{baseUrl}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => copyToClipboard(baseUrl, setBaseUrlCopied)}
          >
            <CopyIcon className="h-4 w-4" />
            <span className="sr-only">Copy Base URL</span>
          </Button>
        </div>
        <div className="text-muted-foreground flex items-center">
          <span className="truncate mr-2">{authToken}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => copyToClipboard(authToken, setAuthTokenCopied)}
          >
            <CopyIcon className="h-4 w-4" />
            <span className="sr-only">Copy Auth Token</span>
          </Button>
        </div>
        <div className="flex items-center">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
          }`}>
            {status}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <CogIcon className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}