"use client";

import React from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface AlertMessageProps {
  message: {
    text: string;
    type: "success" | "error" | "info";
  } | null;
}

export function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl",
      border: "border-green-500/50",
      text: "text-green-400",
      shadow: "shadow-xl shadow-green-500/10",
      icon: CheckCircle,
    },
    error: {
      bg: "bg-gradient-to-r from-red-600/20 to-rose-600/20 backdrop-blur-xl",
      border: "border-red-500/50",
      text: "text-red-400",
      shadow: "shadow-xl shadow-red-500/10",
      icon: XCircle,
    },
    info: {
      bg: "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl",
      border: "border-blue-500/50",
      text: "text-blue-400",
      shadow: "shadow-xl shadow-blue-500/10",
      icon: Info,
    },
  };

  const style = styles[message.type];
  const Icon = style.icon;

  return (
    <div
      className={`${style.bg} ${style.border} ${style.shadow} border rounded-xl p-4 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-top-2`}
    >
      <div className={`${style.text} mt-0.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className={`${style.text} text-sm font-medium flex-1`}>
        {message.text}
      </p>
    </div>
  );
}