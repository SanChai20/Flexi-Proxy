"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Clock,
  Zap,
  Gift,
  Hash,
  MapPin,
  Loader2,
  Lock,
  Globe,
  Unlock,
  Plus,
  Settings,
  FileText,
  Trash2,
} from "lucide-react";
import {
  createPrivateProxyInstance,
  createShortTimeToken,
  deletePrivateProxyInstance,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GatewayClientProps {
  dict: any;
  sub: string;
}

export default function GatewayPrivateClient({
  dict,
  sub,
}: GatewayClientProps) {
  const router = useRouter();

  return null;
}
