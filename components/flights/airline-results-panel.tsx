"use client";

import type { FlightSummary } from "@/lib/types/flight";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AirlineFlightsTable } from "@/components/flights/airline-flights-table";

interface AirlineResultsPanelProps {
  airlineCode: string;
  flights: FlightSummary[];
  totalFlights: number;
  isLoading: boolean;
  error: string;
  onSelectFlight: (flightNumber: string) => void;
}

export function AirlineResultsPanel({
  airlineCode,
  flights,
  totalFlights,
  isLoading,
  error,
  onSelectFlight,
}: AirlineResultsPanelProps) {
  if (isLoading) {
    return (
      <main className="p-6 md:p-8">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Loading airline flights</CardTitle>
            <CardDescription>Fetching active flights for {airlineCode}.</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 md:p-8">
        <Alert variant="destructive" className="max-w-3xl">
          <AlertTitle>Unable to load airline flights</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="space-y-4 p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Airline search: {airlineCode}</CardTitle>
          <CardDescription>
            Showing {flights.length} of {totalFlights} active flights.
          </CardDescription>
        </CardHeader>
      </Card>

      {flights.length ? (
        <AirlineFlightsTable
          airlineCode={airlineCode}
          flights={flights}
          onSelectFlight={onSelectFlight}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No matching flights</CardTitle>
            <CardDescription>
              No active flights matched this filter. Try clearing the search input or choosing
              another airline.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </main>
  );
}
