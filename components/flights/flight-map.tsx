"use client";

import { useMemo } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type GeoJSONSourceSpecification,
} from "react-map-gl/mapbox";
import { Plane } from "lucide-react";
import type { FlightRoutePoint } from "@/lib/types/flight";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface FlightMapProps {
  liveLat: number;
  liveLng: number;
  heading: number | null;
  flightCode: string;
  origin?: FlightRoutePoint;
  destination?: FlightRoutePoint;
}

interface LngLatPoint {
  lng: number;
  lat: number;
}

function createSmoothRouteCoordinates(
  origin: FlightRoutePoint,
  live: { lat: number; lng: number },
  destination: FlightRoutePoint,
  pointsPerSegment = 40
) {
  const waypoints = [
    [origin.lng, origin.lat],
    [live.lng, live.lat],
    [destination.lng, destination.lat],
  ] as const;

  const smoothed: number[][] = [];

  for (let i = 0; i < waypoints.length - 1; i += 1) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];

    for (let step = 0; step <= pointsPerSegment; step += 1) {
      if (i > 0 && step === 0) {
        continue;
      }

      const t = step / pointsPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      const lng =
        0.5 *
        ((2 * p1[0]) +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);

      const lat =
        0.5 *
        ((2 * p1[1]) +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

      smoothed.push([lng, lat]);
    }
  }

  return smoothed;
}

function nearestPointOnSegment(
  point: LngLatPoint,
  start: LngLatPoint,
  end: LngLatPoint
) {
  const vx = end.lng - start.lng;
  const vy = end.lat - start.lat;
  const wx = point.lng - start.lng;
  const wy = point.lat - start.lat;

  const segmentLengthSquared = vx * vx + vy * vy;
  if (segmentLengthSquared === 0) {
    return { ...start };
  }

  const t = Math.max(
    0,
    Math.min(1, (wx * vx + wy * vy) / segmentLengthSquared)
  );

  return {
    lng: start.lng + t * vx,
    lat: start.lat + t * vy,
  };
}

function snapPointToPolyline(
  point: LngLatPoint,
  polyline: number[][]
): LngLatPoint {
  if (polyline.length < 2) {
    return point;
  }

  let closestPoint: LngLatPoint = { lng: polyline[0][0], lat: polyline[0][1] };
  let closestDistanceSquared = Number.POSITIVE_INFINITY;

  for (let i = 0; i < polyline.length - 1; i += 1) {
    const candidate = nearestPointOnSegment(
      point,
      { lng: polyline[i][0], lat: polyline[i][1] },
      { lng: polyline[i + 1][0], lat: polyline[i + 1][1] }
    );

    const dx = candidate.lng - point.lng;
    const dy = candidate.lat - point.lat;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < closestDistanceSquared) {
      closestDistanceSquared = distanceSquared;
      closestPoint = candidate;
    }
  }

  return closestPoint;
}

export function FlightMap({
  liveLat,
  liveLng,
  heading,
  flightCode,
  origin,
  destination,
}: FlightMapProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const hasRoute = Boolean(origin && destination);
  const iconRotation =
    typeof heading === "number" && Number.isFinite(heading) ? heading - 45 : -45;

  const routeCoordinates = useMemo(() => {
    if (!origin || !destination) {
      return null;
    }

    return createSmoothRouteCoordinates(
      origin,
      { lat: liveLat, lng: liveLng },
      destination
    );
  }, [origin, destination, liveLat, liveLng]);

  const markerPoint = useMemo(() => {
    if (!routeCoordinates) {
      return { lng: liveLng, lat: liveLat };
    }

    return snapPointToPolyline({ lng: liveLng, lat: liveLat }, routeCoordinates);
  }, [routeCoordinates, liveLng, liveLat]);

  if (!mapboxToken) {
    return (
      <Alert>
        <AlertTitle>Map unavailable</AlertTitle>
        <AlertDescription>
          Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </AlertDescription>
      </Alert>
    );
  }

  const routeGeojson = hasRoute
    ? ({
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates!,
          },
          properties: {},
        },
      } satisfies GeoJSONSourceSpecification)
    : null;

  return (
    <Card className="overflow-hidden gap-0 py-0">
      <CardContent className="p-0">
        <Map
          key={`${flightCode}-${markerPoint.lat.toFixed(4)}-${markerPoint.lng.toFixed(4)}-${origin?.iata ?? "no-origin"}-${destination?.iata ?? "no-destination"}`}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            latitude: markerPoint.lat,
            longitude: markerPoint.lng,
            zoom: 5,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: "100%", height: 360 }}
        >
          <NavigationControl position="top-right" />
          {routeGeojson ? (
            <Source id="flight-route" {...routeGeojson}>
              <Layer
                id="flight-route-line"
                type="line"
                paint={{
                  "line-color": "#2563eb",
                  "line-width": 3,
                  "line-opacity": 0.8,
                }}
              />
            </Source>
          ) : null}

          {origin ? (
            <Marker longitude={origin.lng} latitude={origin.lat} anchor="center">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
            </Marker>
          ) : null}

          {destination ? (
            <Marker
              longitude={destination.lng}
              latitude={destination.lat}
              anchor="center"
            >
              <div className="h-2.5 w-2.5 rounded-full bg-rose-600 ring-2 ring-white" />
            </Marker>
          ) : null}

          <Marker longitude={markerPoint.lng} latitude={markerPoint.lat} anchor="center">
            <Plane
              className="h-6 w-6 text-primary drop-shadow"
              style={{ transform: `rotate(${iconRotation}deg)` }}
            />
          </Marker>
        </Map>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {hasRoute && origin && destination
          ? `Route ${origin.iata} -> ${destination.iata}. Live position refreshes every 60s.`
          : `Tracking ${flightCode} at ${liveLat.toFixed(4)}, ${liveLng.toFixed(4)}`}
      </CardFooter>
    </Card>
  );
}
