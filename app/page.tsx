"use client";

import { useEffect, useRef, useState } from "react";
import { AirlineResultsPanel } from "@/components/flights/airline-results-panel";
import { FlightSearchSidebar } from "@/components/flights/flight-search-sidebar";
import { FlightResultsPanel } from "@/components/flights/flight-results-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type {
  AirlineFlightsResponse,
  AirlineOption,
  AirlinesResponse,
  FlightData,
  FlightSummary,
} from "@/lib/types/flight";

const CLIENT_AIRLINE_CACHE_TTL_MS = 60_000;
const CLIENT_AIRLINES_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type AirlineClientCacheEntry = {
  response: AirlineFlightsResponse;
  expiresAt: number;
};
type AirlineOptionsClientCacheEntry = {
  airlines: AirlineOption[];
  expiresAt: number;
};

function isExpectedFlightLookupError(error: unknown) {
  return (
    error instanceof Error &&
    /flight not found|not currently active/i.test(error.message)
  );
}

export default function Home() {
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [flightError, setFlightError] = useState("");
  const [activeFlightNumber, setActiveFlightNumber] = useState("");
  const [view, setView] = useState<"flight" | "airline">("flight");

  const [activeAirlineCode, setActiveAirlineCode] = useState("");
  const [airlineFlights, setAirlineFlights] = useState<FlightSummary[]>([]);
  const [airlineError, setAirlineError] = useState("");
  const [isLoadingAirlineFlights, setIsLoadingAirlineFlights] = useState(false);
  const [airlineOptions, setAirlineOptions] = useState<AirlineOption[]>([]);
  const [isLoadingAirlineOptions, setIsLoadingAirlineOptions] = useState(false);
  const [airlineOptionsError, setAirlineOptionsError] = useState("");

  const airlineFlightsCache = useRef<Map<string, AirlineClientCacheEntry>>(new Map());
  const airlineFlightsInFlight = useRef<Map<string, Promise<AirlineFlightsResponse>>>(
    new Map()
  );
  const airlineOptionsCache = useRef<AirlineOptionsClientCacheEntry | null>(null);
  const airlineOptionsInFlight = useRef<Promise<AirlineOption[]> | null>(null);

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
    setFlightError("");
    setFlightData(null);
    setActiveFlightNumber(normalizedFlightNumber);
    setView("flight");

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

  const fetchAirlineFlights = async (
    airlineCode: string
  ): Promise<AirlineFlightsResponse> => {
    const normalizedCode = airlineCode.trim().toUpperCase();
    const now = Date.now();
    const cacheKey = `airline:${normalizedCode}`;
    const cached = airlineFlightsCache.current.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return { ...cached.response, fromCache: true };
    }

    const pending = airlineFlightsInFlight.current.get(cacheKey);
    if (pending) {
      return pending;
    }

    const requestPromise = (async () => {
      const res = await fetch(
        `/api/flights?airline=${encodeURIComponent(normalizedCode)}`
      );
      const data = (await res.json()) as AirlineFlightsResponse | { error?: string };

      if (!res.ok) {
        throw new Error(
          "error" in data
            ? data.error ?? "Unable to fetch airline flights"
            : "Unable to fetch airline flights"
        );
      }

      const response =
        "flights" in data
          ? data
          : {
              airlineCode: normalizedCode,
              flights: [],
              fetchedAt: new Date().toISOString(),
              fromCache: false,
            };

      airlineFlightsCache.current.set(cacheKey, {
        response: { ...response, fromCache: false },
        expiresAt: Date.now() + CLIENT_AIRLINE_CACHE_TTL_MS,
      });

      return response;
    })();

    airlineFlightsInFlight.current.set(cacheKey, requestPromise);
    try {
      return await requestPromise;
    } finally {
      airlineFlightsInFlight.current.delete(cacheKey);
    }
  };

  const fetchAirlineOptions = async (): Promise<AirlineOption[]> => {
    const cached = airlineOptionsCache.current;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.airlines;
    }

    if (airlineOptionsInFlight.current) {
      return airlineOptionsInFlight.current;
    }

    const requestPromise = (async () => {
      const res = await fetch("/api/airlines");
      const data = (await res.json()) as AirlinesResponse | { error?: string };

      if (!res.ok) {
        throw new Error(
          "error" in data ? data.error ?? "Unable to fetch airlines" : "Unable to fetch airlines"
        );
      }

      const airlines = "airlines" in data ? data.airlines : [];
      airlineOptionsCache.current = {
        airlines,
        expiresAt: Date.now() + CLIENT_AIRLINES_CACHE_TTL_MS,
      };

      return airlines;
    })();

    airlineOptionsInFlight.current = requestPromise;
    try {
      return await requestPromise;
    } finally {
      airlineOptionsInFlight.current = null;
    }
  };

  const searchAirlineFlights = async (airlineCode: string) => {
    const normalizedCode = airlineCode.trim().toUpperCase();
    if (!normalizedCode) {
      return;
    }

    // For repeated searches on the same code, reuse in-memory flights and avoid any request.
    if (normalizedCode === activeAirlineCode && airlineFlights.length > 0) {
      setView("airline");
      setAirlineError("");
      return;
    }

    setView("airline");
    setFlightData(null);
    setActiveFlightNumber("");
    setFlightError("");
    setAirlineError("");
    setActiveAirlineCode(normalizedCode);
    setIsLoadingAirlineFlights(true);

    try {
      const data = await fetchAirlineFlights(normalizedCode);
      setAirlineFlights(data.flights);
    } catch (err) {
      setAirlineFlights([]);
      setAirlineError(
        err instanceof Error ? err.message : "Unable to fetch airline flights."
      );
    } finally {
      setIsLoadingAirlineFlights(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadAirlineOptions = async () => {
      setIsLoadingAirlineOptions(true);
      setAirlineOptionsError("");

      try {
        const options = await fetchAirlineOptions();
        if (!cancelled) {
          setAirlineOptions(options);
        }
      } catch (err) {
        if (!cancelled) {
          setAirlineOptions([]);
          setAirlineOptionsError(
            err instanceof Error ? err.message : "Unable to fetch airlines"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAirlineOptions(false);
        }
      }
    };

    void loadAirlineOptions();

    return () => {
      cancelled = true;
    };
  }, []);

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
        setFlightError("");
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
          <FlightResultsPanel
            flight={flightData}
            error={flightError}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}