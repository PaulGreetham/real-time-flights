import { Plane } from "lucide-react";
import type { FlightData } from "@/lib/types/flight";
import { FlightMap } from "@/components/flights/flight-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Plane className="h-6 w-6" />
              Search for a Flight
            </CardTitle>
            <CardDescription>
              Enter a flight number in the sidebar to view live data and routing.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

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

      <Card className="gap-0">
        <CardHeader>
          <CardTitle>Flight Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 pb-6 sm:grid-cols-2">
          <p><strong>Departure:</strong> {flight.dep_iata}</p>
          <p><strong>Arrival:</strong> {flight.arr_iata}</p>
          <p><strong>Latitude:</strong> {flight.lat}</p>
          <p><strong>Longitude:</strong> {flight.lng}</p>
          <p><strong>Altitude:</strong> {flight.alt}</p>
          <p><strong>Speed:</strong> {flight.speed}</p>
        </CardContent>
        <Separator />
        <CardFooter className="bg-muted/20 px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Live position updates every 60 seconds when the tab is visible.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
