"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
} from "lucide-react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import type { FlightSummary } from "@/lib/types/flight"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AirlineFlightsTableProps {
  airlineCode: string
  flights: FlightSummary[]
  onSelectFlight: (flightNumber: string) => void
}

const PAGE_SIZE = 10
const COLUMN_CLASS_NAMES: Record<string, string> = {
  flight: "w-[110px]",
  route: "w-[140px]",
  status: "w-[120px]",
  updated: "w-[190px]",
  actions: "w-[92px] text-right",
}

function formatUpdatedTimestamp(updated: string | null | undefined) {
  if (!updated) {
    return "Unknown"
  }

  const timestamp = Date.parse(updated)
  if (Number.isNaN(timestamp)) {
    return "Unknown"
  }

  return new Date(timestamp).toLocaleString()
}

export function AirlineFlightsTable({
  airlineCode,
  flights,
  onSelectFlight,
}: AirlineFlightsTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<SortingState>([])

  useEffect(() => {
    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }))
  }, [airlineCode, flights])

  const columns = useMemo<ColumnDef<FlightSummary>[]>(
    () => [
      {
        id: "flight",
        accessorFn: (row) => row.flight_iata ?? row.flight_icao ?? "Unknown Flight",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Flight
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const code =
            row.original.flight_iata ??
            row.original.flight_icao ??
            "Unknown Flight"

          return <span className="font-medium">{code}</span>
        },
      },
      {
        id: "route",
        accessorFn: (row) => `${row.dep_iata ?? "?"} -> ${row.arr_iata ?? "?"}`,
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Route
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const route = `${row.original.dep_iata ?? "?"} -> ${row.original.arr_iata ?? "?"}`
          return (
            <span className="text-muted-foreground whitespace-normal">
              {route}
            </span>
          )
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status ?? "Unknown status",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.status ?? "Unknown status"}
          </Badge>
        ),
      },
      {
        id: "updated",
        accessorFn: (row) => Date.parse(row.updated ?? ""),
        sortingFn: "basic",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-2 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Updated
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatUpdatedTimestamp(row.original.updated)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => {
          const displayCode =
            row.original.flight_iata ??
            row.original.flight_icao ??
            "Unknown Flight"

          return (
            <Button
              size="sm"
              className="ml-auto"
              onClick={() => onSelectFlight(displayCode)}
              disabled={displayCode === "Unknown Flight"}
            >
              Track
            </Button>
          )
        },
      },
    ],
    [onSelectFlight]
  )

  const table = useReactTable({
    data: flights,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const pageIndex = table.getState().pagination.pageIndex
  const pageCount = table.getPageCount() || 1
  const currentRows = table.getRowModel().rows.length
  const startRow = flights.length ? pageIndex * PAGE_SIZE + 1 : 0
  const endRow = flights.length ? startRow + currentRows - 1 : 0

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(COLUMN_CLASS_NAMES[header.id])}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(COLUMN_CLASS_NAMES[cell.column.id])}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No matching flights
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 rounded-md border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span>Rows per page: {PAGE_SIZE}</span>
          <span className="hidden sm:inline">|</span>
          <span>
            Showing {startRow}-{endRow} of {flights.length}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-muted-foreground text-sm">
            Page {pageIndex + 1} of {pageCount}
          </p>
          <Button
            variant="outline"
            className="hidden size-8 p-0 sm:inline-flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 sm:inline-flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
