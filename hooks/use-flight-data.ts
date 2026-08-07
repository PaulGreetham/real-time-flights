"use client";

import { useState } from "react";
import { fetchFlight, isExpectedFlightLookupError } from "@/lib/api/flight-api";
import type { FlightData } from "@/lib/types/flight";

export function useFlightData() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [flightError, setFlightError] = useState("");
  const [activeFlightNumber, setActiveFlightNumber] = useState("");

  const searchFlight = async (flightNumber: string) => {
    const normalizedFlightNumber = flightNumber.trim().toUpperCase();
    setFlightError("");
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
      setFlightError(message);
    }
  };

  const clearFlight = () => {
    setFlightData(null);
    setFlightError("");
    setActiveFlightNumber("");
  };

  return {
    flightData,
    flightError,
    activeFlightNumber,
    searchFlight,
    clearFlight,
  };
}
