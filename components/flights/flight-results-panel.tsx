import type { FlightData } from "@/lib/types/flight";
import { FlightMap } from "@/components/flights/flight-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <main className="p-6 md:p-8">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertTitle>Unable to load flight</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!flight) {
    return (
      <main className="flex items-center justify-center p-6 md:p-8">
        <Card className="w-full max-w-xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Search for a Flight</CardTitle>
            <CardDescription>
              Enter a flight number in the sidebar to view live data and routing.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const departureName =
    flight.dep_name ?? flight.route?.origin?.name ?? flight.route?.origin?.city ?? null;
  const arrivalName =
    flight.arr_name ??
    flight.route?.destination?.name ??
    flight.route?.destination?.city ??
    null;

  return (
    <main className="space-y-6 p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            {flight.flight_iata ?? flight.flight_icao ?? "Unknown Flight"}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {flight.airline_iata ?? flight.airline_icao ?? "Unknown Airline"}
            </Badge>
            <Badge>{flight.status}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {hasCoordinates ? (
        <div>
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
        <Alert>
          <AlertTitle>Map unavailable</AlertTitle>
          <AlertDescription>
            Live map is unavailable for this result because coordinates are missing.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Departure</p>
          <p className="text-base font-semibold">{flight.dep_iata ?? "Unknown"}</p>
          {departureName ? (
            <p className="text-sm text-muted-foreground">{departureName}</p>
          ) : null}
        </div>
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Arrival</p>
          <p className="text-base font-semibold">{flight.arr_iata ?? "Unknown"}</p>
          {arrivalName ? (
            <p className="text-sm text-muted-foreground">{arrivalName}</p>
          ) : null}
        </div>
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Latitude</p>
          <p className="text-base font-semibold tabular-nums">{flight.lat}</p>
        </div>
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Longitude</p>
          <p className="text-base font-semibold tabular-nums">{flight.lng}</p>
        </div>
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Altitude</p>
          <p className="text-base font-semibold tabular-nums">{flight.alt}</p>
        </div>
        <div className="space-y-1 rounded-md border bg-muted/20 px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Speed</p>
          <p className="text-base font-semibold tabular-nums">{flight.speed}</p>
        </div>
      </div>
    </main>
  );
}
