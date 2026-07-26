"use client";

import { useEffect, useState } from "react";
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar";
import { FlightResultsPanel } from "@/components/flights/flight-results-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { FlightData } from "@/lib/types/flight";

function isExpectedFlightLookupError(error: unknown) {
  return (
    error instanceof Error &&
    /flight not found|not currently active/i.test(error.message)
  );
}

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
      if (!isExpectedFlightLookupError(err)) {
        console.error(err);
      }
      const message =
        err instanceof Error ? err.message : "Unable to contact server.";
      setError(message);
    }
  };

  useEffect(() => {
    if (!activeFlightNumber) {
      return;
    }

    const refreshLiveFlight = async () => {
      if (document.hidden) {
        return;
      }

      try {
        const latestFlight = await fetchFlight(activeFlightNumber);
        setFlightData(latestFlight);
        setError("");
      } catch (err) {
        if (!isExpectedFlightLookupError(err)) {
          console.error("Live update failed:", err);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshLiveFlight();
      }
    };

    const interval = setInterval(() => {
      void refreshLiveFlight();
    }, 60_000);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeFlightNumber]);

  return (
    <SidebarProvider>
      <FlightSearchSidebar onSearch={searchFlight} />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <p className="text-sm font-medium text-muted-foreground">Flight Tracker</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <FlightResultsPanel
          flight={flightData}
          error={error}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}