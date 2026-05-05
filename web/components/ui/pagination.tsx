"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function Pagination({ total, limit, offset, onPageChange }: PaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (totalPages <= 1) return null;

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * limit;
    onPageChange(newOffset);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <p className="text-sm text-muted-foreground">
        Menampilkan {offset + 1}–{Math.min(offset + limit, total)} dari {total}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(1)}
          disabled={!canPrev}
        >
          <ChevronsLeft size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canPrev}
        >
          <ChevronLeft size={14} />
        </Button>

        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => goToPage(page as number)}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canNext}
        >
          <ChevronRight size={14} />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => goToPage(totalPages)}
          disabled={!canNext}
        >
          <ChevronsRight size={14} />
        </Button>
      </div>
    </div>
  );
}
