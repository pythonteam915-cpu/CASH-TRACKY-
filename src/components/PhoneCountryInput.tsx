import React, { useState, useEffect, useRef } from 'react';
import {
  CountryConfig,
  ALL_COUNTRIES,
  DEFAULT_COUNTRY,
  detectWorldwideCountry,
  formatPhoneNumberAsYouType,
} from '../data/countries';
import { ChevronDown, Search, Check, Sparkles, AlertCircle, Globe, HelpCircle } from 'lucide-react';

interface PhoneCountryInputProps {
  value: string;
  onChange: (phone: string, detectedCountry: CountryConfig) => void;
  selectedCountry: CountryConfig;
  onCountryChange: (country: CountryConfig) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PhoneCountryInput: React.FC<PhoneCountryInputProps> = ({
  value,
  onChange,
  selectedCountry,
  onCountryChange,
  placeholder,
  autoFocus,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAmbiguous, setIsAmbiguous] = useState(false);
  const [isValidNumber, setIsValidNumber] = useState<boolean | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  // Handle phone number input text change
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;

    // Check if input begins with + or contains international calling digits
    if (rawVal.trim().startsWith('+') || rawVal.replace(/\D/g, '').length >= 2) {
      const detection = detectWorldwideCountry(rawVal);
      if (detection.country) {
        setIsAmbiguous(Boolean(detection.isAmbiguous));
        setIsValidNumber(detection.isValid);

        if (detection.country.iso !== selectedCountry.iso) {
          onCountryChange(detection.country);
        }

        // If user entered complete number with dialcode, clean or format as-you-type
        onChange(rawVal, detection.country);
        return;
      }
    }

    // Format as-you-type with selected country context
    const formatted = formatPhoneNumberAsYouType(rawVal, selectedCountry.iso);
    setIsAmbiguous(false);
    onChange(formatted, selectedCountry);
  };

  const handleSelectCountry = (country: CountryConfig) => {
    onCountryChange(country);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setIsAmbiguous(false);

    // Re-evaluate current input with the selected country
    onChange(value, country);
  };

  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.callingCodeDigits.includes(query) ||
      c.iso.toLowerCase().includes(query) ||
      c.currency.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      {/* Input Group: [ 🇮🇳 +91 ▼ ] [ Phone Number ] */}
      <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-200/90 focus-within:border-violet-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-500/20 shadow-xs transition-all overflow-hidden">
        {/* Country Selector Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-1.5 px-3 py-3 bg-slate-100/70 hover:bg-slate-200/60 border-r border-slate-200/90 text-xs font-bold text-slate-800 transition-colors cursor-pointer shrink-0 select-none"
          title={`Country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
        >
          <span className="text-lg leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="text-slate-900 font-extrabold tracking-tight">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180 text-violet-600' : ''
            }`}
          />
        </button>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={value}
          onChange={handlePhoneInputChange}
          placeholder={placeholder || 'Enter phone number'}
          autoFocus={autoFocus}
          className="w-full px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none tabular-nums"
        />

        {/* Validation check badge */}
        {isValidNumber === true && (
          <div className="pr-3 text-emerald-600" title="Valid international phone number">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Ambiguity notice for shared calling codes like +1 */}
      {isAmbiguous && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            {selectedCountry.dialCode} is shared by multiple regions. Confirm if you are in{' '}
            <strong className="underline cursor-pointer" onClick={() => setIsDropdownOpen(true)}>
              {selectedCountry.name}
            </strong>{' '}
            or choose Canada / another region.
          </span>
        </div>
      )}

      {/* Auto-Detection Banner */}
      <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
          <span className="truncate">
            Country: <strong className="text-slate-900">{selectedCountry.flag} {selectedCountry.name}</strong>
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-1 pl-2">
          <span className="text-slate-400">Default Currency:</span>
          <span className="px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-800 font-bold">
            {selectedCountry.currency} ({selectedCountry.currencySymbol})
          </span>
        </div>
      </div>

      {/* Searchable Worldwide Country Dropdown Modal */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white/98 backdrop-blur-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-2 animate-in fade-in duration-150 max-h-80 flex flex-col">
          {/* Search Bar */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search worldwide by country or calling code (+91, +966, UAE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {/* Quick Info Header */}
          <div className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex justify-between">
            <span>All Countries ({filteredCountries.length})</span>
            <span>Calling Code • Currency</span>
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto space-y-1 pr-1 divide-y divide-slate-100/60 flex-1">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <Globe className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                No countries found matching "{searchQuery}"
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry.iso === c.iso && selectedCountry.dialCode === c.dialCode;
                return (
                  <button
                    key={`${c.iso}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? 'bg-violet-600 text-white font-bold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base shrink-0">{c.flag}</span>
                      <span className="truncate font-semibold">{c.name}</span>
                      <span
                        className={`text-[11px] font-mono shrink-0 ${
                          isSelected ? 'text-violet-200' : 'text-slate-400'
                        }`}
                      >
                        {c.dialCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-700'
                        }`}
                      >
                        {c.currency} ({c.currencySymbol})
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
