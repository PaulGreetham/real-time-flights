interface LngLatPoint {
  lng: number;
  lat: number;
}

export function createSmoothRouteCoordinates(
  origin: { lng: number; lat: number },
  live: { lat: number; lng: number },
  destination: { lng: number; lat: number },
  pointsPerSegment = 40
): number[][] {
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

export function nearestPointOnSegment(
  point: LngLatPoint,
  start: LngLatPoint,
  end: LngLatPoint
): LngLatPoint {
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

export function snapPointToPolyline(
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
