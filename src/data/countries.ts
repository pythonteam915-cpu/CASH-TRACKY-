import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  AsYouType,
  CountryCode,
} from 'libphonenumber-js';

export interface CountryConfig {
  iso: string; // ISO 3166-1 alpha-2, e.g. "IN", "SA", "US"
  name: string; // e.g. "India", "Saudi Arabia"
  dialCode: string; // e.g. "+91", "+966"
  callingCodeDigits: string; // e.g. "91", "966"
  flag: string; // Emoji flag e.g. "🇮🇳"
  currency: string; // ISO 4217, e.g. "INR", "SAR", "USD"
  currencySymbol: string; // e.g. "₹", "﷼", "$"
  currencyName: string; // e.g. "Indian Rupee"
}

// Generate unicode flag emoji from ISO 3166-1 alpha-2 code
export function getCountryFlag(isoCode: string): string {
  if (!isoCode || isoCode.length !== 2) return '🌐';
  const codePoints = isoCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

// Comprehensive ISO 3166-1 to ISO 4217 Currency mapping covering all countries & territories
const ISO_COUNTRY_CURRENCIES: Record<string, { currency: string; symbol: string; name: string }> = {
  // Asia
  IN: { currency: 'INR', symbol: '₹', name: 'Indian Rupee' },
  SA: { currency: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  AE: { currency: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  QA: { currency: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  KW: { currency: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  BH: { currency: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
  OM: { currency: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
  JP: { currency: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CN: { currency: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  KR: { currency: 'KRW', symbol: '₩', name: 'South Korean Won' },
  PK: { currency: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  BD: { currency: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  SG: { currency: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  MY: { currency: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  ID: { currency: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  PH: { currency: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  TH: { currency: 'THB', symbol: '฿', name: 'Thai Baht' },
  VN: { currency: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  LK: { currency: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  NP: { currency: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
  IL: { currency: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  JO: { currency: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
  LB: { currency: 'LBP', symbol: 'L£', name: 'Lebanese Pound' },
  IQ: { currency: 'IQD', symbol: 'IQD', name: 'Iraqi Dinar' },
  IR: { currency: 'IRR', symbol: '﷼', name: 'Iranian Rial' },
  TR: { currency: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  HK: { currency: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  TW: { currency: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  KZ: { currency: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  UZ: { currency: 'UZS', symbol: "so'm", name: 'Uzbekistani Som' },

  // Europe
  GB: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  GG: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  JE: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  IM: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  DE: { currency: 'EUR', symbol: '€', name: 'Euro' },
  FR: { currency: 'EUR', symbol: '€', name: 'Euro' },
  IT: { currency: 'EUR', symbol: '€', name: 'Euro' },
  ES: { currency: 'EUR', symbol: '€', name: 'Euro' },
  NL: { currency: 'EUR', symbol: '€', name: 'Euro' },
  BE: { currency: 'EUR', symbol: '€', name: 'Euro' },
  AT: { currency: 'EUR', symbol: '€', name: 'Euro' },
  PT: { currency: 'EUR', symbol: '€', name: 'Euro' },
  IE: { currency: 'EUR', symbol: '€', name: 'Euro' },
  FI: { currency: 'EUR', symbol: '€', name: 'Euro' },
  GR: { currency: 'EUR', symbol: '€', name: 'Euro' },
  SK: { currency: 'EUR', symbol: '€', name: 'Euro' },
  SI: { currency: 'EUR', symbol: '€', name: 'Euro' },
  EE: { currency: 'EUR', symbol: '€', name: 'Euro' },
  LV: { currency: 'EUR', symbol: '€', name: 'Euro' },
  LT: { currency: 'EUR', symbol: '€', name: 'Euro' },
  CY: { currency: 'EUR', symbol: '€', name: 'Euro' },
  MT: { currency: 'EUR', symbol: '€', name: 'Euro' },
  LU: { currency: 'EUR', symbol: '€', name: 'Euro' },
  HR: { currency: 'EUR', symbol: '€', name: 'Euro' },
  MC: { currency: 'EUR', symbol: '€', name: 'Euro' },
  CH: { currency: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  LI: { currency: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  SE: { currency: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  NO: { currency: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  DK: { currency: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  PL: { currency: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  CZ: { currency: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  HU: { currency: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  RO: { currency: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  BG: { currency: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  IS: { currency: 'ISK', symbol: 'kr', name: 'Icelandic Krona' },
  RU: { currency: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  UA: { currency: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },

  // Americas
  US: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { currency: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  MX: { currency: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  BR: { currency: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  AR: { currency: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CL: { currency: 'CLP', symbol: '$', name: 'Chilean Peso' },
  CO: { currency: 'COP', symbol: '$', name: 'Colombian Peso' },
  PE: { currency: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
  UY: { currency: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  PY: { currency: 'PYG', symbol: 'Gs.', name: 'Paraguayan Guarani' },
  BO: { currency: 'BOB', symbol: 'Bs.', name: 'Bolivian Boliviano' },
  EC: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  CR: { currency: 'CRC', symbol: '₡', name: 'Costa Rican Colon' },
  PA: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  DO: { currency: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  JM: { currency: 'JMD', symbol: 'J$', name: 'Jamaican Dollar' },
  TT: { currency: 'TTD', symbol: 'TT$', name: 'Trinidad & Tobago Dollar' },
  BS: { currency: 'BSD', symbol: 'B$', name: 'Bahamian Dollar' },
  BB: { currency: 'BBD', symbol: 'Bds$', name: 'Barbadian Dollar' },
  PR: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  GT: { currency: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },

  // Oceania
  AU: { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { currency: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  FJ: { currency: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
  PG: { currency: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },

  // Africa
  ZA: { currency: 'ZAR', symbol: 'R', name: 'South African Rand' },
  EG: { currency: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  NG: { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  KE: { currency: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  GH: { currency: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  MA: { currency: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  DZ: { currency: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
  TN: { currency: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
  ET: { currency: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  TZ: { currency: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  UG: { currency: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
};

// Fallback resolver for any unlisted territory
function getCurrencyForIso(iso: string): { currency: string; symbol: string; name: string } {
  if (ISO_COUNTRY_CURRENCIES[iso]) {
    return ISO_COUNTRY_CURRENCIES[iso];
  }
  return {
    currency: 'USD',
    symbol: '$',
    name: 'US Dollar',
  };
}

// Generate the complete worldwide country list from libphonenumber-js
function buildWorldwideCountryList(): CountryConfig[] {
  let displayNames: Intl.DisplayNames | null = null;
  try {
    displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    // Fallback if not supported
  }

  const allIsoCodes = getCountries(); // Array of all 245 ISO 3166-1 alpha-2 countries
  const list: CountryConfig[] = [];

  for (const iso of allIsoCodes) {
    try {
      const callingDigits = getCountryCallingCode(iso);
      let countryName: string = iso;
      if (displayNames) {
        countryName = displayNames.of(iso) || iso;
      }
      const flag = getCountryFlag(iso);
      const curr = getCurrencyForIso(iso);

      list.push({
        iso,
        name: countryName,
        dialCode: `+${callingDigits}`,
        callingCodeDigits: callingDigits,
        flag,
        currency: curr.currency,
        currencySymbol: curr.symbol,
        currencyName: curr.name,
      });
    } catch {
      // Skip invalid codes if any
    }
  }

  // Sort alphabetically by English country name
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

// Complete worldwide country dataset supporting all 245 countries and territories A-Z
export const ALL_COUNTRIES: CountryConfig[] = buildWorldwideCountryList();

// Default country fallback
export const DEFAULT_COUNTRY: CountryConfig =
  ALL_COUNTRIES.find((c) => c.iso === 'US') ||
  ALL_COUNTRIES.find((c) => c.iso === 'IN') ||
  ALL_COUNTRIES[0];

/**
 * Format phone as-you-type using libphonenumber-js
 */
export function formatPhoneNumberAsYouType(
  rawInput: string,
  countryHint?: CountryCode | string
): string {
  try {
    const formatter = new AsYouType(countryHint as CountryCode);
    return formatter.input(rawInput);
  } catch {
    return rawInput;
  }
}

/**
 * Worldwide phone number & country detector.
 *
 * Uses libphonenumber-js for precise national / international parsing:
 * 1. Determines country from full phone numbers (e.g. +919876543210 -> IN, +966501234567 -> SA, +14165550199 -> CA, +12025550123 -> US).
 * 2. For partial numbers or calling code prefix (e.g. "+91", "+966", "+971", "+44", "+49", "+81", "+86", "+92", "+880"):
 *    matches the longest dial code.
 * 3. Handles shared calling code ambiguity (e.g. +1):
 *    uses parsed number if area code identifies country (US vs CA), or returns US with isAmbiguous=true if only +1 is provided.
 */
const PRIMARY_COUNTRY_MAP: Record<string, string> = {
  '+1': 'US',
  '+44': 'GB',
  '+7': 'RU',
  '+61': 'AU',
  '+64': 'NZ',
  '+358': 'FI',
  '+47': 'NO',
};

export function detectWorldwideCountry(input: string): {
  country: CountryConfig | null;
  isAmbiguous?: boolean;
  possibleCountries?: CountryConfig[];
  formattedNumber?: string;
  isValid?: boolean;
} {
  const cleaned = input.trim();
  if (!cleaned) return { country: null };

  const withPlus = cleaned.startsWith('+') ? cleaned : `+${cleaned.replace(/\D/g, '')}`;

  // 1. Try full library parsing with libphonenumber-js
  try {
    const parsed = parsePhoneNumberFromString(withPlus);
    if (parsed && parsed.country) {
      const match = ALL_COUNTRIES.find((c) => c.iso === parsed.country);
      if (match) {
        return {
          country: match,
          isAmbiguous: false,
          formattedNumber: parsed.formatInternational(),
          isValid: parsed.isValid(),
        };
      }
    }
  } catch {
    // Continue to prefix match
  }

  // 2. Prefix matching for dialing codes (e.g., user is typing +91, +966, +971, +44...)
  // Extract digits after plus
  const digits = withPlus.replace(/\D/g, '');
  if (!digits) return { country: null };

  // Look for exact dial code matches, prioritizing longest dial codes (e.g. +966, +971 before +9)
  const candidateCountries = ALL_COUNTRIES.filter((c) =>
    withPlus.startsWith(c.dialCode)
  );

  if (candidateCountries.length === 1) {
    return {
      country: candidateCountries[0],
      isAmbiguous: false,
    };
  }

  if (candidateCountries.length > 1) {
    // Check if there is an exact dial code match with a primary country
    const exactDialMatches = candidateCountries.filter((c) => c.dialCode === withPlus);
    const primaryIso = PRIMARY_COUNTRY_MAP[withPlus];

    if (primaryIso) {
      const primaryMatch = ALL_COUNTRIES.find((c) => c.iso === primaryIso);
      if (primaryMatch) {
        return {
          country: primaryMatch,
          isAmbiguous: withPlus === '+1', // +1 is shared by US and Canada, require selection if desired
          possibleCountries: candidateCountries,
        };
      }
    }

    // For +1 shared calling code (US, CA, PR, JM, etc.)
    if (withPlus.startsWith('+1')) {
      // Check if user has entered an area code: e.g. Canadian area codes (416, 647, 514, etc.)
      try {
        const parsedOne = parsePhoneNumberFromString(withPlus, 'US');
        if (parsedOne && parsedOne.country) {
          const match = ALL_COUNTRIES.find((c) => c.iso === parsedOne.country);
          if (match) {
            return {
              country: match,
              isAmbiguous: false,
              formattedNumber: parsedOne.formatInternational(),
            };
          }
        }
      } catch {
        // Fallback
      }

      // If digits length <= 3 (e.g. +1), ambiguous between US, Canada, etc.
      const defaultOne = ALL_COUNTRIES.find((c) => c.iso === 'US') || candidateCountries[0];
      return {
        country: defaultOne,
        isAmbiguous: true,
        possibleCountries: candidateCountries,
      };
    }

    // Sort by longest dial code match first
    candidateCountries.sort((a, b) => b.dialCode.length - a.dialCode.length);
    // If multiple countries share the same dialcode (like +44: GB, GG, JE, IM)
    const matchingDialCode = candidateCountries[0].dialCode;
    const preferredIso = PRIMARY_COUNTRY_MAP[matchingDialCode];
    if (preferredIso) {
      const preferred = candidateCountries.find((c) => c.iso === preferredIso);
      if (preferred) {
        return {
          country: preferred,
          isAmbiguous: false,
          possibleCountries: candidateCountries,
        };
      }
    }

    return {
      country: candidateCountries[0],
      isAmbiguous: false,
      possibleCountries: candidateCountries,
    };
  }

  return { country: null };
}

/**
 * List of standard supported currencies for manual override selection
 */
export const GLOBAL_CURRENCY_LIST = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal (﷼)' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham (د.إ)' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal (﷼)' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar (KD)' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar (BD)' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial (OMR)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan (¥)' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won (₩)' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee (₨)' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka (৳)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar (NZ$)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand (R)' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira (₺)' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real (R$)' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso (Mex$)' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar (HK$)' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona (kr)' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone (kr)' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone (kr)' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty (zł)' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound (E£)' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit (RM)' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah (Rp)' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht (฿)' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso (₱)' },
];
