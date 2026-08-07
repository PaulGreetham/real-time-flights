export function readThemeColor(variableName: string, fallback: string): string {
  if (typeof document === "undefined") {
    return fallback;
  }

  const token = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();

  if (!token) {
    return fallback;
  }

  if (/^(#|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+$)/.test(token)) {
    return token;
  }

  return fallback;
}

export const MAP_STYLES = {
  DARK: "mapbox://styles/mapbox/dark-v11",
  LIGHT: "mapbox://styles/mapbox/light-v11",
} as const;

export const MAP_ROUTE_COLORS = {
  DARK_FALLBACK: "#7aa2ff",
  LIGHT_FALLBACK: "#2563eb",
} as const;
