"use client";

import { useEffect, useState } from "react";
import { fetchAirlineOptions } from "@/lib/api/flight-api";
import { createClientCache } from "@/lib/utils/client-cache";
import type { AirlineOption } from "@/lib/types/flight";

const AIRLINES_CACHE_TTL_MS = 1000 * 60 * 60 * 24;
const airlineOptionsCache = createClientCache<AirlineOption[]>(
  AIRLINES_CACHE_TTL_MS
);

export function useAirlineOptions() {
  const [airlineOptions, setAirlineOptions] = useState<AirlineOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadAirlineOptions = async () => {
      setIsLoading(true);
      setError("");

      try {
        const options = await airlineOptionsCache.getOrFetch(
          "airlines",
          fetchAirlineOptions
        );

        if (!cancelled) {
          setAirlineOptions(options);
        }
      } catch (err) {
        if (!cancelled) {
          setAirlineOptions([]);
          setError(
            err instanceof Error ? err.message : "Unable to fetch airlines"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadAirlineOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  return { airlineOptions, isLoading, error };
}
