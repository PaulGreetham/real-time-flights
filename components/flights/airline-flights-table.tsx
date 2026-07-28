"use client"

import { useEffect, useMemo, useState } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { FlightSummary } from "@/lib/types/flight"
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
    pageSize: 10,
  })

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
        header: "Flight",
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
        header: "Route",
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
        header: "Status",
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.status ?? "Unknown status"}
          </Badge>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatUpdatedTimestamp(row.original.updated)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const displayCode =
            row.original.flight_iata ??
            row.original.flight_icao ??
            "Unknown Flight"

          return (
            <Button
              size="sm"
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
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.id === "actions" ? "w-[90px]" : undefined}
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
                    <TableCell key={cell.id}>
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

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
