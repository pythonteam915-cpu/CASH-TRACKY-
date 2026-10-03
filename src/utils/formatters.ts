import { GLOBAL_CURRENCY_LIST } from '../data/countries';

let currentCurrencyCode = 'USD';
let currentCurrencySymbol = '$';

export function setAppCurrency(code: string, symbol?: string) {
  currentCurrencyCode = code.toUpperCase();
  if (symbol) {
    currentCurrencySymbol = symbol;
  } else {
    const found = GLOBAL_CURRENCY_LIST.find((c) => c.code === currentCurrencyCode);
    currentCurrencySymbol = found ? found.symbol : currentCurrencyCode;
  }
}

export function getAppCurrency(): { code: string; symbol: string } {
  return {
    code: currentCurrencyCode,
    symbol: currentCurrencySymbol,
  };
}

/**
 * Format currency with proper locale & currency code.
 * Seamlessly respects the active country currency detected at login.
 */
export function formatCurrency(amount: number, overrideCurrency?: string): string {
  const code = (overrideCurrency || currentCurrencyCode).toUpperCase();

  // Currencies without minor decimal units
  const zeroDecimalCurrencies = ['JPY', 'KRW', 'VND', 'CLP', 'IDR'];
  const hasZeroDecimals = zeroDecimalCurrencies.includes(code);

  try {
    // Select appropriate locale for clean standard formatting
    let locale = 'en-US';
    if (code === 'INR') locale = 'en-IN';
    else if (code === 'SAR') locale = 'ar-SA';
    else if (code === 'AED') locale = 'ar-AE';
    else if (code === 'GBP') locale = 'en-GB';
    else if (code === 'EUR') locale = 'de-DE';
    else if (code === 'JPY') locale = 'ja-JP';
    else if (code === 'CNY') locale = 'zh-CN';
    else if (code === 'CAD') locale = 'en-CA';
    else if (code === 'AUD') locale = 'en-AU';
    else if (code === 'PKR') locale = 'en-PK';
    else if (code === 'BDT') locale = 'en-BD';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: hasZeroDecimals ? 0 : 2,
      maximumFractionDigits: hasZeroDecimals ? 0 : 2,
    }).format(amount);
  } catch {
    // Fallback if specific currency is not recognized by system Intl
    const found = GLOBAL_CURRENCY_LIST.find((c) => c.code === code);
    const sym = found ? found.symbol : code;
    return `${sym}${amount.toFixed(hasZeroDecimals ? 0 : 2)}`;
  }
}

export function formatCompactCurrency(amount: number, overrideCurrency?: string): string {
  const { symbol } = getAppCurrency();
  const sym = overrideCurrency || symbol;

  if (Math.abs(amount) >= 1000000) {
    return `${sym}${(amount / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 10000) {
    return `${sym}${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, overrideCurrency);
}

export function getCurrentMonthName(): string {
  const date = new Date();
  return date.toLocaleString('default', { month: 'long' });
}
