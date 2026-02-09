import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationControlsProps) {
  const startItem = currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalItems);

  const goToFirstPage = () => onPageChange(0);
  const goToPreviousPage = () => onPageChange(Math.max(0, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages - 1, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages - 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }

    return pages;
  };

  return (
    <div className="relative">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-blue-500/5 rounded-2xl blur-xl"></div>
      
      {/* Main Container */}
      <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Items Info */}
          <div className="text-sm text-slate-400">
            Showing <span className="font-semibold text-cyan-400">{startItem}</span> to{" "}
            <span className="font-semibold text-cyan-400">{endItem}</span> of{" "}
            <span className="font-semibold text-blue-400">{totalItems}</span> results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 0}
              className="group relative p-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-blue-500/50 rounded-lg transition-all duration-300 disabled:hover:border-slate-700/50"
              title="First page"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-lg transition-all duration-300"></div>
              <ChevronsLeft className="relative w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
            </button>

            {/* Previous Page */}
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 0}
              className="group relative p-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-blue-500/50 rounded-lg transition-all duration-300 disabled:hover:border-slate-700/50"
              title="Previous page"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-lg transition-all duration-300"></div>
              <ChevronLeft className="relative w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-1.5 text-slate-500"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = page as number;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`
                      relative min-w-[2.5rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 hover:border-blue-500/30"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-md opacity-50"></div>
                    )}
                    <span className="relative">{pageNum + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile: Current Page Display */}
            <div className="sm:hidden px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <span className="text-sm font-medium">
                <span className="text-blue-400">{currentPage + 1}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{totalPages}</span>
              </span>
            </div>

            {/* Next Page */}
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="group relative p-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-blue-500/50 rounded-lg transition-all duration-300 disabled:hover:border-slate-700/50"
              title="Next page"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-lg transition-all duration-300"></div>
              <ChevronRight className="relative w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
            </button>

            {/* Last Page */}
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages - 1}
              className="group relative p-2 bg-slate-800/50 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700/50 hover:border-blue-500/50 rounded-lg transition-all duration-300 disabled:hover:border-slate-700/50"
              title="Last page"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/10 group-hover:to-cyan-500/10 rounded-lg transition-all duration-300"></div>
              <ChevronsRight className="relative w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
            </button>
          </div>
        </div>

        {/* Decorative Bottom Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      </div>
    </div>
  );
}