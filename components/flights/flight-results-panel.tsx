import { Plane } from "lucide-react";

interface FlightResultsPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flight: any;
  error: string;
}

export function FlightResultsPanel({
  flight,
  error,
}: FlightResultsPanelProps) {
  if (error) {
    return (
      <main className="p-8">
        <h3 className="text-red-500 font-bold">{error}</h3>
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
        {flight.flight_iata}
      </h1>

      <div className="space-y-2">
        <p>
          <strong>Airline:</strong> {flight.airline_name}
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
