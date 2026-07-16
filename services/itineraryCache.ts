/**
 * Lightweight localStorage-backed cache for a user's bookings/itineraries.
 *
 * This lets previously viewed bookings remain accessible when the device has
 * no network connectivity (e.g. the "My Bookings" tab on the Profile page).
 * The cache is intentionally simple (no IndexedDB, no expiry policy beyond
 * "last successful fetch wins") since the data set is small and short-lived.
 */

const CACHE_KEY_PREFIX = 'destinix_bookings_cache_';

export interface CachedBookings<T = any> {
  bookings: T[];
  cachedAt: number;
}

const keyFor = (email: string) => `${CACHE_KEY_PREFIX}${email.toLowerCase()}`;

/** Persist the latest successfully-fetched bookings for a user. */
export const cacheBookings = <T,>(email: string, bookings: T[]): void => {
  if (!email) return;
  try {
    const payload: CachedBookings<T> = { bookings, cachedAt: Date.now() };
    localStorage.setItem(keyFor(email), JSON.stringify(payload));
  } catch (err) {
    // localStorage can throw (quota exceeded, private mode, etc.) - caching
    // is a best-effort enhancement, never let it break the app.
    console.warn('Failed to cache bookings locally:', err);
  }
};

/** Read back the last cached bookings for a user, if any. */
export const getCachedBookings = <T,>(email: string): CachedBookings<T> | null => {
  if (!email) return null;
  try {
    const raw = localStorage.getItem(keyFor(email));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.bookings)) return null;
    return parsed as CachedBookings<T>;
  } catch (err) {
    console.warn('Failed to read cached bookings:', err);
    return null;
  }
};

/** Remove any cached bookings for a user. */
export const clearCachedBookings = (email: string): void => {
  if (!email) return;
  try {
    localStorage.removeItem(keyFor(email));
  } catch {
    // ignore
  }
};
