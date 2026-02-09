import React from "react";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        {/* Outer Glow Ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Main Content */}
        <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 flex flex-col items-center gap-4">
          {/* Spinner with Gradient Ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-30 animate-pulse"></div>
            <Loader2 className="relative w-12 h-12 text-blue-400 animate-spin" strokeWidth={2.5} />
          </div>
          
          {/* Message */}
          <div className="text-center space-y-1">
            <p className="text-slate-300 font-medium">{message}</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
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
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-2xl blur-xl"></div>
      
      {/* Main Error Card */}
      <div className="relative bg-gradient-to-br from-slate-900/80 via-red-950/20 to-slate-900/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          {/* Icon Container */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-md animate-pulse"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="text-red-400 font-bold text-lg mb-1">
                Oops! Something went wrong
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {error}
              </p>
            </div>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
            )}
          </div>
        </div>
        
        {/* Decorative Corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-bl-full"></div>
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
    <div className="relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl blur-xl"></div>
      
      {/* Main Empty Card */}
      <div className="relative text-center py-24 bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
        {icon && (
          <div className="relative w-20 h-20 mx-auto mb-6">
            {/* Icon Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-2xl blur-lg"></div>
            
            {/* Icon Container */}
            <div className="relative w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-700/50">
              {icon}
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="space-y-3 max-w-md mx-auto px-4">
          <h3 className="text-xl font-bold text-slate-300">
            {title}
          </h3>
          {description && (
            <p className="text-slate-500 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {/* Action */}
        {action && (
          <div className="mt-6">
            {action}
          </div>
        )}
        
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-700/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      </div>
    </div>
  );
}