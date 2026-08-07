"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TablePaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
}

export function TablePagination({
  pageIndex,
  pageCount,
  pageSize,
  totalItems,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onFirstPage,
  onLastPage,
}: TablePaginationProps) {
  const startRow = totalItems ? pageIndex * pageSize + 1 : 0;
  const currentPageSize = Math.min(pageSize, totalItems - pageIndex * pageSize);
  const endRow = totalItems ? startRow + currentPageSize - 1 : 0;

  return (
    <div className="flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Rows per page: {pageSize}</span>
        <span className="hidden sm:inline">|</span>
        <span>
          Showing {startRow}-{endRow} of {totalItems}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-muted-foreground text-sm">
          Page {pageIndex + 1} of {pageCount}
        </p>
        <Button
          variant="outline"
          className="hidden size-8 p-0 sm:inline-flex"
          onClick={onFirstPage}
          disabled={!canPreviousPage}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={onNextPage}
          disabled={!canNextPage}
          aria-label="Go to next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden size-8 p-0 sm:inline-flex"
          onClick={onLastPage}
          disabled={!canNextPage}
          aria-label="Go to last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
