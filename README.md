# Real-Time Flights

Real-Time Flights is a flight-tracking web app focused on a single job: search for a flight and immediately understand where that aircraft is, where it is headed, and how it is moving right now.

The experience combines live telemetry, route context, and map visualization in one screen so users can move from "is this flight active?" to "where is it relative to its route?" without switching tools.

## What the app does

- Searches for active flights by:
  - Flight number (IATA or ICAO format).
  - Dropdown-based selectors for airline and flight lookup.
- Returns current flight telemetry including status, latitude/longitude, heading, altitude, and speed.
- Enriches flights with origin and destination airport coordinates to provide route context.
- Renders a live map view with:
  - A plane marker rotated by current heading.
  - Route line from origin to destination with the current position integrated into the path.
  - Origin/destination markers for clear directional context.
- Auto-refreshes flight data every 60 seconds while the tab is visible.
- Handles API and configuration failure states with clear user-facing feedback.

## Data flow at a glance

1. The user submits flight search criteria from the sidebar (flight number or dropdown selections such as airline).
2. The app calls a server route (`/api/flight`) rather than exposing external API keys in the client.
3. The server queries AirLabs flight data, with automatic fallback between IATA and ICAO parameters.
4. The server augments the flight with airport coordinates (cached in-memory with a 7-day TTL).
5. The client renders details and map state from the normalized response.

## Stack

### Framework and language

- Next.js 16 (App Router, server route handlers)
- React 19
- TypeScript 5

### Mapping and geospatial UI

- Mapbox GL + `react-map-gl`
- Custom route smoothing and point-to-polyline snapping for cleaner live map presentation

### Data source

- [AirLabs Flights API](https://airlabs.co/) for live flight telemetry
- [AirLabs Airports API](https://airlabs.co/) for origin/destination coordinate enrichment

### Styling and UI system

- Tailwind CSS 4
- shadcn/ui component patterns
- `lucide-react` icons
- Utility helpers: `clsx`, `tailwind-merge`, `class-variance-authority`

### Operational characteristics

- Server-side API key usage for external calls
- In-memory airport coordinate cache and in-flight request deduplication
- Client polling strategy optimized to refresh only when the tab is visible
