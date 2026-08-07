"use client";

import { useEffect } from "react";

export interface UseFlightAutoRefreshOptions {
  flightNumber: string;
  onRefresh: (flightNumber: string) => Promise<void>;
  intervalMs?: number;
  enabled?: boolean;
}

export function useFlightAutoRefresh({
  flightNumber,
  onRefresh,
  intervalMs = 60_000,
  enabled = true,
}: UseFlightAutoRefreshOptions) {
  useEffect(() => {
    if (!enabled || !flightNumber) {
      return;
    }

    const refreshFlight = async () => {
      if (document.hidden) {
        return;
      }

      try {
        await onRefresh(flightNumber);
      } catch (err) {
        console.error("Auto-refresh failed:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void refreshFlight();
      }
    };

    const interval = setInterval(() => {
      void refreshFlight();
    }, intervalMs);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flightNumber, onRefresh, intervalMs, enabled]);
}
