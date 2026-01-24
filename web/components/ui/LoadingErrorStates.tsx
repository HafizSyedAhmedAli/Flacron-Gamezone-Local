import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="inline-block animate-spin h-8 w-8 text-blue-500 mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-xl">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-semibold mb-1">Error</p>
          <p className="text-sm text-red-400">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-700/50">
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
