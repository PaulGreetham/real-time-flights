export interface FlightRoutePoint {
  iata: string;
  name?: string;
  city?: string;
  countryCode?: string;
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
  dep_name?: string | null;
  arr_name?: string | null;
  lat?: number | null;
  lng?: number | null;
  dir?: number | null;
  alt?: number | null;
  speed?: number | null;
  route?: FlightRoute;
}

export interface AirlineOption {
  code: string;
  label: string;
}

export interface FlightSummary {
  id: string;
  flight_iata?: string | null;
  flight_icao?: string | null;
  airline_iata?: string | null;
  airline_icao?: string | null;
  status?: string | null;
  dep_iata?: string | null;
  arr_iata?: string | null;
  lat?: number | null;
  lng?: number | null;
  updated?: string | null;
}

export interface AirlineFlightsResponse {
  airlineCode: string;
  flights: FlightSummary[];
  fetchedAt: string;
  fromCache: boolean;
}

export interface AirlinesResponse {
  airlines: AirlineOption[];
  fetchedAt: string;
  fromCache: boolean;
}
