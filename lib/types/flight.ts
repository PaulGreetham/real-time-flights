export interface FlightRoutePoint {
  iata: string;
  lat: number;
  lng: number;
}

export interface FlightRoute {
  origin?: FlightRoutePoint;
  destination?: FlightRoutePoint;
}

export interface FlightData {
  flight_iata?: string | null;
  flight_icao?: string | null;
  airline_iata?: string | null;
  airline_icao?: string | null;
  status?: string | null;
  dep_iata?: string | null;
  arr_iata?: string | null;
  lat?: number | null;
  lng?: number | null;
  dir?: number | null;
  alt?: number | null;
  speed?: number | null;
  route?: FlightRoute;
}
