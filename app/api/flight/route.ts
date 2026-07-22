import { NextResponse } from "next/server";

const AIRLABS_BASE = "https://airlabs.co/api/v9/flights";
const AIRLABS_AIRPORTS = "https://airlabs.co/api/v9/airports";
const AIRPORT_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

type FlightParam = "flight_iata" | "flight_icao";
type Coordinates = { lat: number; lng: number };
type AirportDetails = {
  iata: string;
  name?: string;
  city?: string;
  countryCode?: string;
  coordinates: Coordinates | null;
};
type AirportCacheEntry = { airport: AirportDetails; expiresAt: number };

const airportCoordinatesCache = new Map<string, AirportCacheEntry>();
const airportCoordinatesInFlight = new Map<string, Promise<AirportDetails | null>>();

async function queryAirlabs(
  apiKey: string,
  paramName: FlightParam,
  flightNum: string
) {
  const url = `${AIRLABS_BASE}?api_key=${apiKey}&${paramName}=${flightNum}`;

  // Log the param name + flight number only — never log the full URL, it contains the API key.
  console.log(`Calling AirLabs (${paramName}) for flight:`, flightNum);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`AirLabs HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // AirLabs returns { error: { message, code } } on failed requests (bad key, rate limit, etc)
  if (data.error) {
    throw new Error(data.error.message ?? "AirLabs API error");
  }

  return data.response as unknown[];
}

function toCoordinates(value: unknown): Coordinates | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const lat =
    typeof candidate.lat === "number"
      ? candidate.lat
      : typeof candidate.lat === "string"
        ? Number(candidate.lat)
        : null;
  const lng =
    typeof candidate.lng === "number"
      ? candidate.lng
      : typeof candidate.lng === "string"
        ? Number(candidate.lng)
        : null;

  if (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
  ) {
    return { lat, lng };
  }

  return null;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

async function queryAirportDetails(
  apiKey: string,
  airportIata: string
): Promise<AirportDetails | null> {
  const normalizedIata = airportIata.toUpperCase();
  const now = Date.now();
  const cached = airportCoordinatesCache.get(normalizedIata);

  if (cached && cached.expiresAt > now) {
    return cached.airport;
  }

  const pending = airportCoordinatesInFlight.get(normalizedIata);
  if (pending) {
    return pending;
  }

  const requestPromise = (async () => {
    const url = `${AIRLABS_AIRPORTS}?api_key=${apiKey}&iata_code=${normalizedIata}`;
    const res = await fetch(url);

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as { response?: unknown[]; error?: unknown };
    if (data.error || !Array.isArray(data.response) || data.response.length === 0) {
      return null;
    }

    const airportResponse = data.response[0] as Record<string, unknown>;
    const airport: AirportDetails = {
      iata: normalizedIata,
      name: toOptionalString(airportResponse.name),
      city: toOptionalString(airportResponse.city),
      countryCode: toOptionalString(airportResponse.country_code),
      coordinates: toCoordinates(airportResponse),
    };

    airportCoordinatesCache.set(normalizedIata, {
      airport,
      expiresAt: now + AIRPORT_CACHE_TTL_MS,
    });

    return airport;
  })();

  airportCoordinatesInFlight.set(normalizedIata, requestPromise);

  try {
    return await requestPromise;
  } finally {
    airportCoordinatesInFlight.delete(normalizedIata);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const flightNum = searchParams
    .get("flightNumber")
    ?.replace(/\s+/g, "")
    .toUpperCase();

  if (!flightNum) {
    return NextResponse.json(
      { error: "Flight number required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.AIRLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing AIRLABS_API_KEY" },
      { status: 500 }
    );
  }

  // ICAO airline codes are 3 letters (e.g. AAL654, GTI8274).
  // IATA airline codes are 2 chars, letter or letter+digit (e.g. AA654, 5Y8274).
  // Use this to guess which param to try first, then fall back to the other
  // if the first attempt comes back empty — so users can enter either format.
  const looksIcao = /^[A-Z]{3}\d+$/.test(flightNum);
  const firstParam: FlightParam = looksIcao ? "flight_icao" : "flight_iata";
  const secondParam: FlightParam = looksIcao ? "flight_iata" : "flight_icao";

  try {
    let response = await queryAirlabs(apiKey, firstParam, flightNum);

    if (!response?.length) {
      response = await queryAirlabs(apiKey, secondParam, flightNum);
    }

    if (!response?.length) {
      // The /flights endpoint only returns currently active/airborne flights,
      // so this often just means the flight isn't flying right now —
      // not necessarily an invalid flight number.
      return NextResponse.json(
        { error: "Flight not found or not currently active" },
        { status: 404 }
      );
    }

    const flight = response[0] as Record<string, unknown>;
    const depIata =
      typeof flight.dep_iata === "string" ? flight.dep_iata : undefined;
    const arrIata =
      typeof flight.arr_iata === "string" ? flight.arr_iata : undefined;

    const [originAirport, destinationAirport] = await Promise.all([
      depIata ? queryAirportDetails(apiKey, depIata) : Promise.resolve(null),
      arrIata ? queryAirportDetails(apiKey, arrIata) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ...flight,
      dep_name:
        originAirport?.name ??
        (typeof flight.dep_name === "string" ? flight.dep_name : undefined),
      arr_name:
        destinationAirport?.name ??
        (typeof flight.arr_name === "string" ? flight.arr_name : undefined),
      route: {
        origin:
          depIata && originAirport?.coordinates
            ? {
                iata: depIata,
                name: originAirport.name,
                city: originAirport.city,
                countryCode: originAirport.countryCode,
                ...originAirport.coordinates,
              }
            : undefined,
        destination:
          arrIata && destinationAirport?.coordinates
            ? {
                iata: arrIata,
                name: destinationAirport.name,
                city: destinationAirport.city,
                countryCode: destinationAirport.countryCode,
                ...destinationAirport.coordinates,
              }
            : undefined,
      },
    });
  } catch (err) {
    console.error("Failed to fetch AirLabs:", err);

    return NextResponse.json(
      { error: "Failed to fetch AirLabs" },
      { status: 500 }
    );
  }
}
