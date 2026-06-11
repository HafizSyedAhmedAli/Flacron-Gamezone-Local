'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface Props {
   isOpen: boolean;
   title: string;
   message: string;
   onConfirm: () => void;
   onCancel: () => void;
   isDeleting?: boolean;
   confirmLabel?: string;
   confirmVariant?: 'danger' | 'warning';
}

export function DeleteConfirmModal({
   isOpen,
   title,
   message,
   onConfirm,
   onCancel,
   isDeleting = false,
   confirmLabel = 'Delete',
   confirmVariant = 'danger',
}: Props) {
   if (!isOpen) return null;

   const confirmClass =
      confirmVariant === 'danger'
         ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-500/20'
         : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-amber-500/20';

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isDeleting && onCancel()}
         />
         <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
               <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
               <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600/50 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
               >
                  Cancel
               </button>
               <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${confirmClass}`}
               >
                  {isDeleting ? (
                     <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Working...
                     </>
                  ) : (
                     confirmLabel
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
