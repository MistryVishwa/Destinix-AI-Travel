import { Coordinates, ItineraryDay } from '../types';

// Lightweight, free geocoding via OpenStreetMap's Nominatim service (no API key
// or billing required). Results are cached in-memory for the session and
// requests are issued one-at-a-time to respect Nominatim's usage policy.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Reject a resolved day marker if it lands further than this from the trip
// centre — guards against a vague day title geocoding to the wrong continent.
const MAX_DISTANCE_FROM_CENTER_KM = 400;

const cache = new Map<string, Coordinates | null>();

/** Great-circle distance between two points, in kilometres. */
export const haversineKm = (a: Coordinates, b: Coordinates): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const isValidCoordinates = (c: unknown): c is Coordinates =>
  !!c &&
  typeof (c as Coordinates).lat === 'number' &&
  typeof (c as Coordinates).lng === 'number' &&
  Math.abs((c as Coordinates).lat) <= 90 &&
  Math.abs((c as Coordinates).lng) <= 180;

/** Geocode a free-text place to coordinates, or null if it can't be resolved. */
export const geocodePlace = async (query: string): Promise<Coordinates | null> => {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      cache.set(key, null);
      return null;
    }
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : undefined;
    if (!first) {
      cache.set(key, null);
      return null;
    }
    const coords: Coordinates = { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
    const result = isValidCoordinates(coords) ? coords : null;
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
};

export interface ResolvedItinerary {
  /** Map centre — the geocoded destination, or the mean of resolved day markers. */
  center: Coordinates | null;
  /** Itinerary days with `coordinates` populated wherever they could be resolved. */
  days: ItineraryDay[];
}

/**
 * Ensure each itinerary day has coordinates. Days that already carry AI-supplied
 * coordinates are kept as-is; the rest are geocoded from their location name /
 * title. Anything that can't be resolved is left without coordinates so the map
 * can degrade gracefully.
 */
export const resolveItineraryCoordinates = async (
  destination: string,
  itinerary: ItineraryDay[]
): Promise<ResolvedItinerary> => {
  const center = await geocodePlace(destination);

  const days: ItineraryDay[] = [];
  for (const day of itinerary) {
    if (isValidCoordinates(day.coordinates)) {
      days.push(day);
      continue;
    }

    const label = (day.locationName || day.title || '').trim();
    const query = label ? `${label}, ${destination}` : destination;
    const resolved = await geocodePlace(query);

    // Discard obviously-wrong hits that fall far from the trip centre.
    if (resolved && center && haversineKm(center, resolved) > MAX_DISTANCE_FROM_CENTER_KM) {
      days.push(day);
      continue;
    }

    days.push(resolved ? { ...day, coordinates: resolved } : day);
  }

  // If the destination itself couldn't be geocoded, fall back to the average of
  // whatever day markers we did resolve.
  const located = days.map(d => d.coordinates).filter(isValidCoordinates);
  const fallbackCenter =
    located.length > 0
      ? {
          lat: located.reduce((s, c) => s + c.lat, 0) / located.length,
          lng: located.reduce((s, c) => s + c.lng, 0) / located.length,
        }
      : null;

  return { center: center ?? fallbackCenter, days };
};
