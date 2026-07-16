"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
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
    <aside className="border-r bg-muted/30 p-6 md:p-8">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plane className="h-5 w-5 rotate-45 text-primary" />
            Real-Time Flights
          </CardTitle>
          <CardDescription>
            Search by flight number and track live movement.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="flight-search">Track Live Flight</Label>
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
        </CardContent>
      </Card>
    </aside>
  )
}
