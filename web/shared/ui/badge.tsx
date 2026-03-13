import React from "react";
import clsx from "clsx";

export type BadgeVariant = "default" | "success" | "destructive" | "warning";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-800 border border-gray-200",
  success: "bg-green-100 text-green-800 border border-green-200",
  destructive: "bg-red-100 text-red-800 border border-red-200",
  warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      role="status"
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
