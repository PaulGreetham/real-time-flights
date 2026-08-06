# Real-Time Flights

Real-Time Flights is a flight-tracking web app with a landing page and an operational dashboard for live flight analysis.

The experience combines live telemetry, route context, and map visualization so users can move from "is this flight active?" to "where is it relative to its route?" without switching tools.

## Routes

- `/`: Marketing-style landing page with product highlights and call-to-actions.
- `/tracker`: Flight operations dashboard for searching and monitoring live flights.

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

## Color system

The app uses a semantic token system in [`app/globals.css`](app/globals.css) with `oklch` values for both `:root` (light) and `.dark` (dark).

- Core semantic tokens: `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--destructive`, `--border`, `--input`, `--ring`.
- Extended tokens for this app: `--overlay`, `--map-route`, `--map-origin`, `--map-destination`, `--map-marker-ring`, `--map-aircraft`, and `--chart-1..5`.
- Tokens are bridged to Tailwind utilities via `@theme inline`, so components should use semantic classes (for example `bg-primary`, `text-muted-foreground`, `border-border`) instead of hardcoded colors.

### Updating the palette

1. Change `oklch` values under both `:root` and `.dark` in [`app/globals.css`](app/globals.css).
2. Keep usage semantic in components (`bg-*`, `text-*`, `border-*` token classes) and avoid raw hex or fixed palette classes unless required by a third-party API.
3. For map overlays, update map tokens in CSS and consume them in [`components/flights/flight-map.tsx`](components/flights/flight-map.tsx).

## Visual QA checklist (light + dark)

- Toggle theme and verify cards, sidebar, buttons, inputs, alerts, and badges all preserve readable contrast.
- Verify destructive states are legible (text, border, and focus ring) in both themes.
- Confirm map base style switches with theme (`light-v11` in light mode, `dark-v11` in dark mode).
- Confirm route line, origin marker, destination marker, and aircraft icon remain visible on both map styles.
- Check hover/focus states on dropdown options, table actions, and pagination controls.
