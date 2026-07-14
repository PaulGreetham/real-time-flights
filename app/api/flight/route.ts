import { NextResponse } from "next/server";

const AIRLABS_BASE = "https://airlabs.co/api/v9/flights";
const AIRLABS_AIRPORTS = "https://airlabs.co/api/v9/airports";

type FlightParam = "flight_iata" | "flight_icao";
type Coordinates = { lat: number; lng: number };

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
  const lat = candidate.lat;
  const lng = candidate.lng;

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

async function queryAirportCoordinates(
  apiKey: string,
  airportIata: string
): Promise<Coordinates | null> {
  const url = `${AIRLABS_AIRPORTS}?api_key=${apiKey}&iata_code=${airportIata}`;
  const res = await fetch(url);

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { response?: unknown[]; error?: unknown };
  if (data.error || !Array.isArray(data.response) || data.response.length === 0) {
    return null;
  }

  return toCoordinates(data.response[0]);
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

    const [originCoords, destinationCoords] = await Promise.all([
      depIata ? queryAirportCoordinates(apiKey, depIata) : Promise.resolve(null),
      arrIata ? queryAirportCoordinates(apiKey, arrIata) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      ...flight,
      route: {
        origin:
          depIata && originCoords
            ? { iata: depIata, ...originCoords }
            : undefined,
        destination:
          arrIata && destinationCoords
            ? { iata: arrIata, ...destinationCoords }
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
