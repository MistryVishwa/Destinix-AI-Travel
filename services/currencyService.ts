
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
