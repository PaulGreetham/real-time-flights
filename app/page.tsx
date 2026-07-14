"use client";

import { useEffect, useState } from "react";
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar";
import { FlightResultsPanel } from "@/components/flights/flight-results-panel";
import type { FlightData } from "@/lib/types/flight";

export default function Home() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [error, setError] = useState("");
  const [activeFlightNumber, setActiveFlightNumber] = useState("");

  const fetchFlight = async (flightNumber: string): Promise<FlightData | null> => {
    const res = await fetch(
      `/api/flight?flightNumber=${encodeURIComponent(flightNumber)}`
    );
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error ?? "Unable to fetch flight");
    }

    return data as FlightData;
  };

  const searchFlight = async (flightNumber: string) => {
    const normalizedFlightNumber = flightNumber.trim().toUpperCase();
    setError("");
    setFlightData(null);
    setActiveFlightNumber(normalizedFlightNumber);

    try {
      const data = await fetchFlight(normalizedFlightNumber);
      setFlightData(data);
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Unable to contact server.";
      setError(message);
    }
  };

  useEffect(() => {
    if (!activeFlightNumber) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const latestFlight = await fetchFlight(activeFlightNumber);
        setFlightData(latestFlight);
        setError("");
      } catch (err) {
        console.error("Live update failed:", err);
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [activeFlightNumber]);

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