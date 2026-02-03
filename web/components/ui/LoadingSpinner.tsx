"use client";

import React from "react";
import { motion } from "framer-motion";

type Size = "sm" | "md" | "lg";

interface LoadingSpinnerProps {
  /** spinner size */
  size?: Size;
  /** optional message shown next to spinner */
  message?: string;
  /** render centered full-screen overlay */
  fullScreen?: boolean;
  /** additional tailwind classes for wrapper */
  className?: string;
}

const SIZE_MAP: Record<Size, string> = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

export default function LoadingSpinner({
  size = "md",
  message,
  fullScreen = false,
  className = "",
}: LoadingSpinnerProps) {
  const spinnerCls = `${SIZE_MAP[size]} rounded-full border-t-transparent border-slate-200/80 animate-spin`;

  // wrapper classes (fullScreen shows a subtle backdrop)
  const wrapperCls = fullScreen
    ? `fixed inset-0 z-50 flex items-center justify-center p-4  ${className}`
    : `inline-flex items-center ${className}`;

  return (
    <div className={wrapperCls} role="status" aria-live="polite">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="flex items-center"
      >
        <div className={spinnerCls} aria-hidden="true" />
        {/* Visible message */}
        {message ? (
          <span className="ml-3 text-sm font-medium text-slate-200">
            {message}
          </span>
        ) : (
          // keep an always-present visually-hidden label for screen readers
          <span className="sr-only">Loading</span>
        )}
      </motion.div>
    </div>
  );
}
