
import { CONVERSION_RATES } from '../utils/currency';

// Free, no-API-key currency conversion using @fawazahmed0/currency-api (CDN-hosted JSON, no auth).
// Falls back to the static CONVERSION_RATES table (utils/currency.ts) if the live request fails.
const CURRENCY_API_BASE =
  'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies';

export async function convertToINR(amount: number, fromCurrency: string): Promise<number> {
  const currency = fromCurrency.toUpperCase();

  if (currency === 'INR') {
    return amount;
  }

  try {
    const res = await fetch(`${CURRENCY_API_BASE}/${currency.toLowerCase()}.json`);
    if (!res.ok) throw new Error('Currency API request failed');

    const data = await res.json();
    const rate = data[currency.toLowerCase()]?.inr;

    if (typeof rate !== 'number') {
      throw new Error(`No INR rate found for currency: ${currency}`);
    }

    return Math.round(amount * rate * 100) / 100;
  } catch (error) {
    console.error('Live currency conversion failed, using fallback rate:', error);
    const fallbackRate = CONVERSION_RATES[currency];
    if (!fallbackRate) {
      throw error;
    }
    return Math.round(amount * fallbackRate * 100) / 100;
  }
}

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Simple in-memory cache of rate tables keyed by base currency, refreshed at most once per
// CACHE_TTL_MS. This keeps repeated conversions (e.g. re-rendering a price list) from hammering
// the free API, while still picking up fresh rates periodically. See README for the documented
// rate source + refresh interval.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const rateCache = new Map<string, { rates: Record<string, number>; fetchedAt: number }>();

async function getRatesForBase(base: string): Promise<Record<string, number>> {
  const key = base.toLowerCase();
  const cached = rateCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  const res = await fetch(`${CURRENCY_API_BASE}/${key}.json`);
  if (!res.ok) throw new Error('Currency API request failed');

  const data = await res.json();
  const rates = data[key];
  if (!rates || typeof rates !== 'object') {
    throw new Error(`No rate table found for currency: ${base}`);
  }

  rateCache.set(key, { rates, fetchedAt: Date.now() });
  return rates;
}

/**
 * Converts an amount between any two supported currencies using live rates from
 * @fawazahmed0/currency-api, falling back to the static CONVERSION_RATES table
 * (pivoted through INR) if the live request fails or the pair isn't in the response.
 * A failed fetch never throws past this point unless both the live call and the
 * static fallback are unavailable for the requested currencies.
 */
export async function convertAmount(amount: number, from: string, to: string): Promise<number> {
  const fromCurrency = from.toUpperCase();
  const toCurrency = to.toUpperCase();

  if (fromCurrency === toCurrency) return amount;

  try {
    const rates = await getRatesForBase(fromCurrency);
    const rate = rates[toCurrency.toLowerCase()];
    if (typeof rate !== 'number') {
      throw new Error(`No rate found for ${fromCurrency}->${toCurrency}`);
    }
    return Math.round(amount * rate * 100) / 100;
  } catch (error) {
    console.error('Live currency conversion failed, using fallback rate table:', error);
    const fromRate = CONVERSION_RATES[fromCurrency];
    const toRate = CONVERSION_RATES[toCurrency];
    if (!fromRate || !toRate) {
      throw error;
    }
    const amountInInr = amount * fromRate;
    return Math.round((amountInInr / toRate) * 100) / 100;
  }
}
