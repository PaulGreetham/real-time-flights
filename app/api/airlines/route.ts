import { NextResponse } from "next/server";
import type { AirlineOption, AirlinesResponse } from "@/lib/types/flight";

const AIRLABS_AIRLINES = "https://airlabs.co/api/v9/airlines";
const AIRLINES_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

type AirlinesCacheEntry = {
  payload: Omit<AirlinesResponse, "fromCache">;
  expiresAt: number;
};

const airlinesCache = new Map<string, AirlinesCacheEntry>();
let airlinesInFlight: Promise<AirlinesResponse> | null = null;

function toOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toAirlineOption(value: unknown): AirlineOption | null {
  const row = (value ?? {}) as Record<string, unknown>;
  const iata = toOptionalString(row.iata_code)?.toUpperCase();
  const icao = toOptionalString(row.icao_code)?.toUpperCase();
  const name = toOptionalString(row.name);
  const code = iata ?? icao;

  if (!code) {
    return null;
  }

  return {
    code,
    label: name ? `${code} - ${name}` : code,
  };
}

async function fetchAirlines(apiKey: string): Promise<AirlinesResponse> {
  const now = Date.now();
  const cached = airlinesCache.get("all");
  if (cached && cached.expiresAt > now) {
    return { ...cached.payload, fromCache: true };
  }

  if (airlinesInFlight) {
    return airlinesInFlight;
  }

  const requestPromise = (async () => {
    const url = new URL(AIRLABS_AIRLINES);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("_fields", "iata_code,icao_code,name");

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`AirLabs HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { response?: unknown[]; error?: { message?: string } };
    if (data.error) {
      throw new Error(data.error.message ?? "AirLabs API error");
    }

    const options = (Array.isArray(data.response) ? data.response : [])
      .map(toAirlineOption)
      .filter((airline): airline is AirlineOption => Boolean(airline))
      .sort((a, b) => a.label.localeCompare(b.label));

    const payload = {
      airlines: options,
      fetchedAt: new Date().toISOString(),
    };

    airlinesCache.set("all", {
      payload,
      expiresAt: Date.now() + AIRLINES_CACHE_TTL_MS,
    });

    return { ...payload, fromCache: false };
  })();

  airlinesInFlight = requestPromise;
  try {
    return await requestPromise;
  } finally {
    airlinesInFlight = null;
  }
}

export async function GET() {
  const apiKey = process.env.AIRLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing AIRLABS_API_KEY" }, { status: 500 });
  }

  try {
    const response = await fetchAirlines(apiKey);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch airlines:", error);
    return NextResponse.json({ error: "Failed to fetch airlines" }, { status: 500 });
  }
}
