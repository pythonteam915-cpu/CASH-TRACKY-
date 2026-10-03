/**
 * Currency Conversion Service (Modular Architecture)
 *
 * Separates display currency logic from currency conversion.
 * Ready for live exchange-rate API integration (e.g., Open Exchange Rates,
 * ExchangeRate-API, Frankfurter, or Supabase Edge Functions).
 */

export interface ExchangeRateResult {
  base: string;
  rates: Record<string, number>;
  date: string;
  isLive: boolean;
}

// Baseline reference exchange rates relative to USD (clearly documented as reference baseline)
const REFERENCE_RATES_TO_USD: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  SAR: 3.75,
  AED: 3.67,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  JPY: 154.2,
  CNY: 7.23,
  KRW: 1375.0,
  PKR: 278.5,
  BDT: 117.2,
  AUD: 1.52,
  CAD: 1.36,
  NZD: 1.65,
  SGD: 1.35,
  CHF: 0.91,
  ZAR: 18.4,
  TRY: 32.5,
  BRL: 5.15,
  MXN: 16.9,
  HKD: 7.82,
  SEK: 10.6,
  NOK: 10.8,
  DKK: 6.85,
  PLN: 3.95,
  EGP: 47.5,
  NGN: 1450.0,
  MYR: 4.72,
  IDR: 16200.0,
  THB: 36.8,
  PHP: 57.8,
};

let cachedRates: Record<string, number> = REFERENCE_RATES_TO_USD;
let lastFetchTime = 0;

/**
 * Fetch latest exchange rates from an exchange rate provider.
 * Falls back safely to reference rates if offline.
 */
export async function fetchLiveExchangeRates(base = 'USD'): Promise<ExchangeRateResult> {
  const now = Date.now();
  // Cache for 10 minutes
  if (now - lastFetchTime < 600000 && cachedRates) {
    return {
      base,
      rates: cachedRates,
      date: new Date().toISOString(),
      isLive: false,
    };
  }

  try {
    // Connect to free public exchange rate endpoint (Frankfurter / open rate API)
    const response = await fetch(`https://api.frankfurter.app/latest?from=${base}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.rates) {
        cachedRates = { ...REFERENCE_RATES_TO_USD, ...data.rates, [base]: 1.0 };
        lastFetchTime = now;
        return {
          base,
          rates: cachedRates,
          date: data.date || new Date().toISOString(),
          isLive: true,
        };
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return {
    base,
    rates: cachedRates,
    date: new Date().toISOString(),
    isLive: false,
  };
}

/**
 * Convert an amount between two currencies using baseline or live rates.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  customRates?: Record<string, number>
): { convertedAmount: number; rate: number } {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return { convertedAmount: amount, rate: 1.0 };
  }

  const rates = customRates || cachedRates;
  const rateFrom = rates[from] || 1.0;
  const rateTo = rates[to] || 1.0;

  // Convert to USD base then to target currency
  const amountInUsd = amount / rateFrom;
  const convertedAmount = amountInUsd * rateTo;
  const effectiveRate = rateTo / rateFrom;

  return {
    convertedAmount: Math.round(convertedAmount * 100) / 100,
    rate: effectiveRate,
  };
}
