"use client"

import { useState } from "react"
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar"
import { FlightResultsPanel } from "@/components/flights/flight-results-panel"

export default function Home() {
  const [activeFlight, setActiveFlight] = useState<string | null>(null)

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[350px_1fr]">
      <FlightSearchSidebar onSearch={setActiveFlight} />
      <FlightResultsPanel activeFlight={activeFlight} />
    </div>
  )
}
