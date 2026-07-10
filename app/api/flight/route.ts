import { NextResponse } from "next/server";

const AIRLABS_BASE = "https://airlabs.co/api/v9/flights";

type FlightParam = "flight_iata" | "flight_icao";

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

    return NextResponse.json(response[0]);
  } catch (err) {
    console.error("Failed to fetch AirLabs:", err);

    return NextResponse.json(
      { error: "Failed to fetch AirLabs" },
      { status: 500 }
    );
  }
}
