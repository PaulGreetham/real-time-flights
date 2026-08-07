"use client";

import { useState } from "react";
import { fetchAirlineFlights } from "@/lib/api/flight-api";
import { createClientCache } from "@/lib/utils/client-cache";
import type { AirlineFlightsResponse, FlightSummary } from "@/lib/types/flight";

const AIRLINE_CACHE_TTL_MS = 60_000;
const airlineFlightsCache = createClientCache<AirlineFlightsResponse>(
  AIRLINE_CACHE_TTL_MS
);

export function useAirlineFlights() {
  const [activeAirlineCode, setActiveAirlineCode] = useState("");
  const [airlineFlights, setAirlineFlights] = useState<FlightSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const searchAirlineFlights = async (airlineCode: string) => {
    const normalizedCode = airlineCode.trim().toUpperCase();
    if (!normalizedCode) {
      return;
    }

    if (normalizedCode === activeAirlineCode && airlineFlights.length > 0) {
      setError("");
      return;
    }

    setActiveAirlineCode(normalizedCode);
    setError("");
    setIsLoading(true);

    try {
      const data = await airlineFlightsCache.getOrFetch(
        `airline:${normalizedCode}`,
        () => fetchAirlineFlights(normalizedCode)
      );
      setAirlineFlights(data.flights);
    } catch (err) {
      setAirlineFlights([]);
      setError(
        err instanceof Error ? err.message : "Unable to fetch airline flights."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearAirlineFlights = () => {
    setAirlineFlights([]);
    setError("");
    setActiveAirlineCode("");
  };

  return {
    activeAirlineCode,
    airlineFlights,
    error,
    isLoading,
    searchAirlineFlights,
    clearAirlineFlights,
  };
}
