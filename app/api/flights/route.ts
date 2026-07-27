import { NextResponse } from "next/server";
import type { AirlineFlightsResponse, FlightSummary } from "@/lib/types/flight";

const AIRLABS_BASE = "https://airlabs.co/api/v9/flights";
const AIRLINE_CACHE_TTL_MS = 60_000;

type AirlineParam = "airline_iata" | "airline_icao";
type AirlineCacheEntry = {
  payload: Omit<AirlineFlightsResponse, "fromCache">;
  expiresAt: number;
};

const airlineFlightsCache = new Map<string, AirlineCacheEntry>();
const airlineFlightsInFlight = new Map<string, Promise<AirlineFlightsResponse>>();

function toOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toOptionalNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : null;
  }

  return null;
}

function toFlightSummary(value: unknown, index: number): FlightSummary {
  const row = (value ?? {}) as Record<string, unknown>;
  const flightIata = toOptionalString(row.flight_iata);
  const flightIcao = toOptionalString(row.flight_icao);

  return {
    id: `${flightIata ?? flightIcao ?? "unknown"}-${index}`,
    flight_iata: flightIata,
    flight_icao: flightIcao,
    airline_iata: toOptionalString(row.airline_iata),
    airline_icao: toOptionalString(row.airline_icao),
    status: toOptionalString(row.status),
    dep_iata: toOptionalString(row.dep_iata),
    arr_iata: toOptionalString(row.arr_iata),
    lat: toOptionalNumber(row.lat),
    lng: toOptionalNumber(row.lng),
    updated: toOptionalString(row.updated),
  };
}

async function queryFlights(
  apiKey: string,
  paramName: AirlineParam,
  airlineCode: string
): Promise<FlightSummary[]> {
  const url = new URL(AIRLABS_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set(paramName, airlineCode);
  url.searchParams.set(
    "_fields",
    "flight_iata,flight_icao,airline_iata,airline_icao,status,dep_iata,arr_iata,lat,lng,updated"
  );

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AirLabs HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { response?: unknown[]; error?: { message?: string } };
  if (data.error) {
    throw new Error(data.error.message ?? "AirLabs API error");
  }

  const rows = Array.isArray(data.response) ? data.response : [];
  return rows.map(toFlightSummary);
}

async function fetchAirlineFlights(
  apiKey: string,
  requestedCode: string,
  firstParam: AirlineParam,
  fallbackParam: AirlineParam | null,
  cacheKey: string
): Promise<AirlineFlightsResponse> {
  const now = Date.now();
  const cached = airlineFlightsCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return {
      ...cached.payload,
      fromCache: true,
    };
  }

  const pending = airlineFlightsInFlight.get(cacheKey);
  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    let flights = await queryFlights(apiKey, firstParam, requestedCode);

    if (!flights.length && fallbackParam) {
      flights = await queryFlights(apiKey, fallbackParam, requestedCode);
    }

    const payload = {
      airlineCode: requestedCode,
      flights,
      fetchedAt: new Date().toISOString(),
    };

    airlineFlightsCache.set(cacheKey, {
      payload,
      expiresAt: Date.now() + AIRLINE_CACHE_TTL_MS,
    });

    return {
      ...payload,
      fromCache: false,
    };
  })();

  airlineFlightsInFlight.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } finally {
    airlineFlightsInFlight.delete(cacheKey);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const airlineIata = searchParams.get("airlineIata")?.trim().toUpperCase();
  const airlineIcao = searchParams.get("airlineIcao")?.trim().toUpperCase();
  const fallbackAirline = searchParams.get("airline")?.trim().toUpperCase();

  const selectedCode = airlineIata || airlineIcao || fallbackAirline;
  if (!selectedCode) {
    return NextResponse.json(
      { error: "airlineIata, airlineIcao, or airline is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.AIRLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing AIRLABS_API_KEY" }, { status: 500 });
  }

  // If caller specifies airlineIata/airlineIcao we do a single external call.
  // Generic `airline` input uses a fallback strategy for resilience.
  let firstParam: AirlineParam = "airline_iata";
  let fallbackParam: AirlineParam | null = null;

  if (airlineIcao) {
    firstParam = "airline_icao";
  } else if (!airlineIata && fallbackAirline) {
    const looksIcao = /^[A-Z]{3}$/.test(selectedCode);
    firstParam = looksIcao ? "airline_icao" : "airline_iata";
    fallbackParam = looksIcao ? "airline_iata" : "airline_icao";
  }

  const cacheKey = `${firstParam}:${selectedCode}`;

  try {
    const response = await fetchAirlineFlights(
      apiKey,
      selectedCode,
      firstParam,
      fallbackParam,
      cacheKey
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch airline flights:", error);
    return NextResponse.json({ error: "Failed to fetch airline flights" }, { status: 500 });
  }
}
