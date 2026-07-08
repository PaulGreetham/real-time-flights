"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plane } from "lucide-react"

interface FlightSearchSidebarProps {
  onSearch: (flightNumber: string) => void
}

export function FlightSearchSidebar({ onSearch }: FlightSearchSidebarProps) {
  const [flightNumber, setFlightNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!flightNumber.trim()) return
    onSearch(flightNumber.toUpperCase())
  }

  return (
    <aside className="border-r bg-muted/30 p-6 flex flex-col gap-6">
      {/* Brand Header */}
      <div className="flex items-center gap-2 border-b pb-4">
        <Plane className="h-6 w-6 text-primary rotate-45" />
        <h1 className="text-xl font-bold tracking-tight">Real-Time Flights</h1>
      </div>

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="flight-search" className="text-sm font-medium text-muted-foreground">
            Track Live Flight
          </label>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="flight-search"
              type="text"
              placeholder="e.g. AA123, DL456"
              className="pl-9 uppercase"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          Locate Aircraft
        </Button>
      </form>
    </aside>
  )
}
