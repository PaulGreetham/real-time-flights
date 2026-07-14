import { Plane } from "lucide-react";
import type { FlightData } from "@/lib/types/flight";
import { FlightMap } from "@/components/flights/flight-map";

interface FlightResultsPanelProps {
  flight: FlightData | null;
  error: string;
}

export function FlightResultsPanel({
  flight,
  error,
}: FlightResultsPanelProps) {
  const mapLat =
    typeof flight?.lat === "number" && Number.isFinite(flight.lat)
      ? flight.lat
      : null;
  const mapLng =
    typeof flight?.lng === "number" && Number.isFinite(flight.lng)
      ? flight.lng
      : null;
  const hasCoordinates = mapLat !== null && mapLng !== null;

  if (error) {
    return (
      <main className="p-8">
        <h2 className="text-red-500 font-bold">{error}</h2>
      </main>
    );
  }

  if (!flight) {
    return (
      <main className="p-8 flex items-center justify-center">
        <div className="text-center">
          <Plane className="mx-auto mb-4 h-10 w-10" />
          <h2 className="text-xl font-bold">
            Search for a Flight
          </h2>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        {flight.flight_iata ?? flight.flight_icao ?? "Unknown Flight"}
      </h1>

      {hasCoordinates ? (
        <div className="mb-6">
          <FlightMap
            key={`${flight.flight_iata ?? flight.flight_icao ?? "flight"}-${mapLat}-${mapLng}-${flight.route?.origin?.iata ?? "no-origin"}-${flight.route?.destination?.iata ?? "no-destination"}`}
            liveLat={mapLat}
            liveLng={mapLng}
            heading={
              typeof flight.dir === "number" && Number.isFinite(flight.dir)
                ? flight.dir
                : null
            }
            flightCode={flight.flight_iata ?? flight.flight_icao ?? "Flight"}
            origin={flight.route?.origin}
            destination={flight.route?.destination}
          />
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">
          Live map unavailable for this result (missing coordinates).
        </p>
      )}

      <div className="space-y-2">
        <p>
          <strong>Airline:</strong>{" "}
          {flight.airline_iata ?? flight.airline_icao ?? "Unknown"}
        </p>

        <p>
          <strong>Status:</strong> {flight.status}
        </p>

        <p>
          <strong>Departure:</strong> {flight.dep_iata}
        </p>

        <p>
          <strong>Arrival:</strong> {flight.arr_iata}
        </p>

        <p>
          <strong>Latitude:</strong> {flight.lat}
        </p>

        <p>
          <strong>Longitude:</strong> {flight.lng}
        </p>

        <p>
          <strong>Altitude:</strong> {flight.alt}
        </p>

        <p>
          <strong>Speed:</strong> {flight.speed}
        </p>
      </div>
    </main>
  );
}
