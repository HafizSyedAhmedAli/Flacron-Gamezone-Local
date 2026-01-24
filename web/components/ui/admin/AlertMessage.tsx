"use client";

import React from "react";

interface AlertMessageProps {
  message: {
    text: string;
    type: "success" | "error" | "info";
  } | null;
}

export function AlertMessage({ message }: AlertMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`text-sm p-3 rounded-lg ${
        message.type === "error"
          ? "bg-red-500/10 text-red-500"
          : message.type === "success"
            ? "bg-green-500/10 text-green-500"
            : "bg-blue-500/10 text-blue-500"
      }`}
    >
      {message.text}
    </div>
  );
}
