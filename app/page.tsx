"use client";

import { useState } from "react";
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar";
import { FlightResultsPanel } from "@/components/flights/flight-results-panel";

export default function Home() {
  const [flightData, setFlightData] = useState<unknown>(null);
  const [error, setError] = useState("");

  const searchFlight = async (flightNumber: string) => {
    setError("");
    setFlightData(null);

    try {
      const res = await fetch(
        `/api/flight?flightNumber=${encodeURIComponent(flightNumber)}`
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setFlightData(data);
    } catch (err) {
      console.error(err);
      setError("Unable to contact server.");
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[350px_1fr]">
      <FlightSearchSidebar onSearch={searchFlight} />

      <FlightResultsPanel
        flight={flightData}
        error={error}
      />
    </div>
  );
}