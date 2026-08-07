import type {
  AirlineFlightsResponse,
  AirlineOption,
  AirlinesResponse,
  FlightData,
} from "@/lib/types/flight";

export async function fetchFlight(
  flightNumber: string
): Promise<FlightData | null> {
  const res = await fetch(
    `/api/flight?flightNumber=${encodeURIComponent(flightNumber)}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? "Unable to fetch flight");
  }

  return data as FlightData;
}

export async function fetchAirlineFlights(
  airlineCode: string
): Promise<AirlineFlightsResponse> {
  const res = await fetch(
    `/api/flights?airline=${encodeURIComponent(airlineCode)}`
  );
  const data = (await res.json()) as
    | AirlineFlightsResponse
    | { error?: string };

  if (!res.ok) {
    throw new Error(
      "error" in data
        ? data.error ?? "Unable to fetch airline flights"
        : "Unable to fetch airline flights"
    );
  }

  return "flights" in data
    ? data
    : {
        airlineCode,
        flights: [],
        fetchedAt: new Date().toISOString(),
        fromCache: false,
      };
}

export async function fetchAirlineOptions(): Promise<AirlineOption[]> {
  const res = await fetch("/api/airlines");
  const data = (await res.json()) as AirlinesResponse | { error?: string };

  if (!res.ok) {
    throw new Error(
      "error" in data
        ? data.error ?? "Unable to fetch airlines"
        : "Unable to fetch airlines"
    );
  }

  return "airlines" in data ? data.airlines : [];
}

export function isExpectedFlightLookupError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /flight not found|not currently active/i.test(error.message)
  );
}
