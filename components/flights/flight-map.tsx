"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
  type GeoJSONSourceSpecification,
} from "react-map-gl/mapbox";
import { Plane } from "lucide-react";
import type { FlightRoutePoint } from "@/lib/types/flight";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useSidebar } from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import {
  createSmoothRouteCoordinates,
  snapPointToPolyline,
} from "@/lib/map-geometry";
import {
  readThemeColor,
  MAP_STYLES,
  MAP_ROUTE_COLORS,
} from "@/lib/map-utils";

interface FlightMapProps {
  liveLat: number;
  liveLng: number;
  heading: number | null;
  flightCode: string;
  origin?: FlightRoutePoint;
  destination?: FlightRoutePoint;
}

export function FlightMap({
  liveLat,
  liveLng,
  heading,
  flightCode,
  origin,
  destination,
}: FlightMapProps) {
  const { open, isMobile } = useSidebar();
  const { resolvedTheme } = useTheme();
  const mapRef = useRef<MapRef | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const hasRoute = Boolean(origin && destination);
  const iconRotation =
    typeof heading === "number" && Number.isFinite(heading) ? heading - 45 : -45;
  const mapStyle =
    resolvedTheme === "dark" ? MAP_STYLES.DARK : MAP_STYLES.LIGHT;
  const mapRouteFallback =
    resolvedTheme === "dark"
      ? MAP_ROUTE_COLORS.DARK_FALLBACK
      : MAP_ROUTE_COLORS.LIGHT_FALLBACK;
  const mapRouteColor = readThemeColor("--map-route", mapRouteFallback);

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

  const resizeMap = useCallback(() => {
    mapRef.current?.resize();
  }, []);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) {
      return;
    }

    let frameId: number | null = null;
    const observer = new ResizeObserver(() => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        resizeMap();
      });
    });

    observer.observe(container);
    resizeMap();

    return () => {
      observer.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [resizeMap]);

  useEffect(() => {
    const immediateFrame = requestAnimationFrame(() => {
      resizeMap();
    });
    const settleDelay = isMobile ? 0 : 220;
    const timeoutId = window.setTimeout(() => {
      resizeMap();
    }, settleDelay);

    return () => {
      cancelAnimationFrame(immediateFrame);
      clearTimeout(timeoutId);
    };
  }, [open, isMobile, resizeMap]);

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
        <div ref={mapContainerRef}>
          <Map
            ref={mapRef}
            reuseMaps
            mapboxAccessToken={mapboxToken}
            initialViewState={{
              latitude: markerPoint.lat,
              longitude: markerPoint.lng,
              zoom: 5,
            }}
            mapStyle={mapStyle}
            style={{ width: "100%", height: 360 }}
            onLoad={resizeMap}
          >
            <NavigationControl position="top-right" />
            {routeGeojson ? (
              <Source id="flight-route" {...routeGeojson}>
                <Layer
                  id="flight-route-line"
                  type="line"
                  paint={{
                    "line-color": mapRouteColor,
                    "line-width": 3,
                    "line-opacity": 0.8,
                  }}
                />
              </Source>
            ) : null}

            {origin ? (
              <Marker longitude={origin.lng} latitude={origin.lat} anchor="center">
                <div className="h-2.5 w-2.5 rounded-full bg-map-origin ring-2 ring-map-marker-ring" />
              </Marker>
            ) : null}

            {destination ? (
              <Marker
                longitude={destination.lng}
                latitude={destination.lat}
                anchor="center"
              >
                <div className="h-2.5 w-2.5 rounded-full bg-map-destination ring-2 ring-map-marker-ring" />
              </Marker>
            ) : null}

            <Marker longitude={markerPoint.lng} latitude={markerPoint.lat} anchor="center">
              <Plane
                className="h-6 w-6 fill-map-aircraft text-map-aircraft drop-shadow"
                strokeWidth={1.6}
                style={{ transform: `rotate(${iconRotation}deg)` }}
              />
            </Marker>
          </Map>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        {hasRoute && origin && destination
          ? `Route ${origin.iata} -> ${destination.iata}. Live position refreshes every 60s.`
          : `Tracking ${flightCode} at ${liveLat.toFixed(4)}, ${liveLng.toFixed(4)}`}
      </CardFooter>
    </Card>
  );
}
