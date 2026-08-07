import type { FlightData } from "@/lib/types/flight";

export function formatFlightCode(
  flight: { flight_iata?: string | null; flight_icao?: string | null } | null
): string {
  if (!flight) return "Unknown Flight";
  return flight.flight_iata ?? flight.flight_icao ?? "Unknown Flight";
}

export function formatAirlineCode(
  flight: { airline_iata?: string | null; airline_icao?: string | null } | null
): string {
  if (!flight) return "Unknown Airline";
  return flight.airline_iata ?? flight.airline_icao ?? "Unknown Airline";
}

export function formatAirportRoute(
  depIata?: string | null,
  arrIata?: string | null
): string {
  return `${depIata ?? "?"} -> ${arrIata ?? "?"}`;
}

export function formatTimestamp(updated: string | null | undefined): string {
  if (!updated) {
    return "Unknown";
  }

  const timestamp = Date.parse(updated);
  if (Number.isNaN(timestamp)) {
    return "Unknown";
  }

  return new Date(timestamp).toLocaleString();
}

export interface FlightCoordinates {
  lat: number;
  lng: number;
}

export function getFlightCoordinates(
  flight: FlightData | null
): FlightCoordinates | null {
  if (!flight) return null;

  const lat = flight.lat;
  const lng = flight.lng;

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

export function getFlightHeading(flight: FlightData | null): number | null {
  if (!flight) return null;

  const dir = flight.dir;
  if (typeof dir === "number" && Number.isFinite(dir)) {
    return dir;
  }

  return null;
}

export function getDepartureName(flight: FlightData | null): string | null {
  if (!flight) return null;

  return (
    flight.dep_name ??
    flight.route?.origin?.name ??
    flight.route?.origin?.city ??
    null
  );
}

export function getArrivalName(flight: FlightData | null): string | null {
  if (!flight) return null;

  return (
    flight.arr_name ??
    flight.route?.destination?.name ??
    flight.route?.destination?.city ??
    null
  );
}
