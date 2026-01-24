import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationControlsProps) {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = currentPage * (itemsPerPage || 0) + 1;
  const endItem = Math.min(
    (currentPage + 1) * (itemsPerPage || 0),
    totalItems || 0,
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground mr-2">
          Page {currentPage + 1} of {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
