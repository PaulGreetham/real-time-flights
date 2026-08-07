"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowUpDown } from "lucide-react"
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
import { TablePagination } from "@/components/ui/table-pagination"
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

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount() || 1;

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

      <TablePagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        totalItems={flights.length}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
        onFirstPage={() => table.setPageIndex(0)}
        onLastPage={() => table.setPageIndex(pageCount - 1)}
      />
    </div>
  );
}
