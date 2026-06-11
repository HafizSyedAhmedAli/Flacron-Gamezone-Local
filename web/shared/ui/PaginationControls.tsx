'use client';

import {
   ChevronLeft,
   ChevronRight,
   ChevronsLeft,
   ChevronsRight,
} from 'lucide-react';

interface Props {
   currentPage: number;
   totalPages: number;
   onPageChange: (page: number) => void;
   itemsPerPage: number;
   totalItems: number;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
   if (total <= 5) return Array.from({ length: total }, (_, i) => i);
   const pages: (number | '...')[] = [];
   if (current <= 2) {
      for (let i = 0; i < 4; i++) pages.push(i);
      pages.push('...');
      pages.push(total - 1);
   } else if (current >= total - 3) {
      pages.push(0);
      pages.push('...');
      for (let i = total - 4; i < total; i++) pages.push(i);
   } else {
      pages.push(0, '...', current - 1, current, current + 1, '...', total - 1);
   }
   return pages;
}

export function PaginationControls({
   currentPage,
   totalPages,
   onPageChange,
   itemsPerPage,
   totalItems,
}: Props) {
   const startItem = currentPage * itemsPerPage + 1;
   const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

   const NavBtn = ({
      onClick,
      disabled,
      children,
   }: {
      onClick: () => void;
      disabled: boolean;
      children: React.ReactNode;
   }) => (
      <button
         onClick={onClick}
         disabled={disabled}
         className="p-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-blue-500/50 rounded-lg transition-all"
      >
         {children}
      </button>
   );

   return (
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
         <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-slate-400">
               Showing{' '}
               <span className="font-semibold text-cyan-400">{startItem}</span>{' '}
               – <span className="font-semibold text-cyan-400">{endItem}</span>{' '}
               of{' '}
               <span className="font-semibold text-blue-400">{totalItems}</span>
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
               <NavBtn
                  onClick={() => onPageChange(0)}
                  disabled={currentPage === 0}
               >
                  <ChevronsLeft className="w-4 h-4 text-slate-400" />
               </NavBtn>
               <NavBtn
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 0}
               >
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
               </NavBtn>

               <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers(currentPage, totalPages).map((page, i) =>
                     page === '...' ? (
                        <span
                           key={`e-${i}`}
                           className="px-2 text-slate-500 text-sm"
                        >
                           …
                        </span>
                     ) : (
                        <button
                           key={page}
                           onClick={() => onPageChange(page as number)}
                           className={`min-w-[2.25rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                              page === currentPage
                                 ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                 : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50 hover:border-blue-500/30'
                           }`}
                        >
                           {(page as number) + 1}
                        </button>
                     )
                  )}
               </div>

               <div className="sm:hidden px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm">
                  <span className="text-blue-400 font-medium">
                     {currentPage + 1}
                  </span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{totalPages}</span>
               </div>

               <NavBtn
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
               >
                  <ChevronRight className="w-4 h-4 text-slate-400" />
               </NavBtn>
               <NavBtn
                  onClick={() => onPageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
               >
                  <ChevronsRight className="w-4 h-4 text-slate-400" />
               </NavBtn>
            </div>
         </div>
      </div>
   );
}
