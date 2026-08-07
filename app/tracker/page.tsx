"use client";

import { useState } from "react";
import { AirlineResultsPanel } from "@/components/flights/airline-results-panel";
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar";
import { FlightResultsPanel } from "@/components/flights/flight-results-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useFlightData } from "@/hooks/use-flight-data";
import { useAirlineFlights } from "@/hooks/use-airline-flights";
import { useAirlineOptions } from "@/hooks/use-airline-options";
import { useFlightAutoRefresh } from "@/hooks/use-flight-auto-refresh";
import { fetchFlight, isExpectedFlightLookupError } from "@/lib/api/flight-api";

export default function TrackerPage() {
  const [view, setView] = useState<"flight" | "airline">("flight");

  const {
    flightData,
    flightError,
    activeFlightNumber,
    searchFlight: searchFlightBase,
    clearFlight,
  } = useFlightData();

  const {
    activeAirlineCode,
    airlineFlights,
    error: airlineError,
    isLoading: isLoadingAirlineFlights,
    searchAirlineFlights: searchAirlineFlightsBase,
    clearAirlineFlights,
  } = useAirlineFlights();

  const {
    airlineOptions,
    isLoading: isLoadingAirlineOptions,
    error: airlineOptionsError,
  } = useAirlineOptions();

  const searchFlight = async (flightNumber: string) => {
    await searchFlightBase(flightNumber);
    setView("flight");
    clearAirlineFlights();
  };

  const searchAirlineFlights = async (airlineCode: string) => {
    await searchAirlineFlightsBase(airlineCode);
    setView("airline");
    clearFlight();
  };

  const refreshLiveFlight = async (flightNumber: string) => {
    try {
      const latestFlight = await fetchFlight(flightNumber);
      if (latestFlight) {
        await searchFlightBase(flightNumber);
      }
    } catch (err) {
      if (!isExpectedFlightLookupError(err)) {
        console.error("Live update failed:", err);
      }
    }
  };

  useFlightAutoRefresh({
    flightNumber: activeFlightNumber,
    onRefresh: refreshLiveFlight,
    enabled: view === "flight" && !!activeFlightNumber,
  });

  return (
    <SidebarProvider>
      <FlightSearchSidebar
        onSearch={searchFlight}
        onAirlineSearch={searchAirlineFlights}
        airlineOptions={airlineOptions}
        isLoadingAirlineOptions={isLoadingAirlineOptions}
        airlineOptionsError={airlineOptionsError}
      />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center border-b px-4">
          <SidebarTrigger className="-ml-4 size-14 rounded-none" />
          <Separator orientation="vertical" className="mr-4" />
          <p className="text-sm font-medium text-muted-foreground">Flight Tracker</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {view === "airline" && !flightData ? (
          <AirlineResultsPanel
            airlineCode={activeAirlineCode}
            flights={airlineFlights}
            totalFlights={airlineFlights.length}
            isLoading={isLoadingAirlineFlights}
            error={airlineError}
            onSelectFlight={searchFlight}
          />
        ) : (
          <FlightResultsPanel flight={flightData} error={flightError} />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
