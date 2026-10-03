import React, { useState } from 'react';
import {
  User,
  Mail,
  DollarSign,
  Moon,
  Sun,
  LogOut,
  Check,
  Shield,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  Globe,
  Phone,
  Search,
} from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playTabSwitchSound } from '../../utils/soundEffects';
import { useAuth } from '../../context/AuthContext';
import { ALL_COUNTRIES, CountryConfig, GLOBAL_CURRENCY_LIST } from '../../data/countries';
import { formatCurrency } from '../../utils/formatters';

interface ProfileScreenProps {
  userName?: string;
  userEmail?: string;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  onLogout: () => void;
  monthlyBudget: number;
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userName = 'Alex Morgan',
  userEmail = 'alex.morgan@cashtracky.app',
  currency,
  onCurrencyChange,
  onLogout,
  monthlyBudget,
  onOpenAuth,
}) => {
  const { userProfile, activeCountry, activeCurrency, updateCurrency, updateCountry, currentUser } = useAuth();

  const [name, setName] = useState(userProfile?.displayName || userName);
  const [email, setEmail] = useState(userProfile?.email || userEmail);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [soundActive, setSoundActive] = useState<boolean>(isSoundEnabled());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Country manual search state
  const [countrySearch, setCountrySearch] = useState('');
  const [isChangingCountry, setIsChangingCountry] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCurrencySelect = async (currCode: string) => {
    const found = GLOBAL_CURRENCY_LIST.find((c) => c.code === currCode);
    if (found) {
      await updateCurrency(found.code, found.symbol);
      onCurrencyChange(`${found.code} (${found.symbol})`);
      playTabSwitchSound();
    }
  };

  const handleCountrySelect = async (country: CountryConfig) => {
    await updateCountry(country);
    setIsChangingCountry(false);
    setCountrySearch('');
    playTabSwitchSound();
  };

  const filteredCountries = ALL_COUNTRIES.filter((c) => {
    const query = countrySearch.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.dialCode.includes(query) ||
      c.currency.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
          Settings & Account
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Profile
        </h2>
      </div>

      {/* User Info Card */}
      <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/25">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[180px]">
                {userProfile?.phone || email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs">{activeCountry.flag}</span>
                <span className="text-[11px] font-semibold text-violet-600">
                  {activeCountry.name} ({activeCurrency.code})
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email / Phone
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-3 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-md shadow-violet-500/20 cursor-pointer"
            >
              Save Profile
            </button>
          </form>
        ) : (
          <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
            {userProfile?.phone && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-violet-600" />
                  Verified Phone
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {userProfile.phone}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-600" />
                Detected Region
              </span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <span>{activeCountry.flag}</span>
                <span>{activeCountry.name}</span>
                <span className="text-slate-400 font-mono text-[11px]">({activeCountry.dialCode})</span>
              </span>
            </div>
          </div>
        )}

        {savedSuccess && (
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>Profile updated successfully!</span>
          </div>
        )}
      </div>

      {/* Detected Country & Location Card */}
      <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-600" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Country & Region
              </h4>
              <p className="text-[11px] text-slate-400">
                Auto-detected from phone calling code
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsChangingCountry(!isChangingCountry)}
            className="text-xs font-bold text-violet-600 hover:text-violet-800 cursor-pointer"
          >
            {isChangingCountry ? 'Done' : 'Change'}
          </button>
        </div>

        {/* Current Detected Country Pill */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" role="img" aria-label={activeCountry.name}>
              {activeCountry.flag}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {activeCountry.name}
              </p>
              <p className="text-[11px] text-slate-500">
                Calling Code: <strong>{activeCountry.dialCode}</strong> • Default: <strong>{activeCountry.currency} ({activeCountry.currencySymbol})</strong>
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
            Active
          </span>
        </div>

        {/* Searchable Country Selector Popup */}
        {isChangingCountry && (
          <div className="p-3 rounded-2xl bg-white border border-violet-200 shadow-md space-y-2 animate-in fade-in duration-150">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search country or code (e.g. Saudi Arabia, UAE, +91)..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {filteredCountries.map((c) => {
                const isSelected = activeCountry.iso === c.iso && activeCountry.dialCode === c.dialCode;
                return (
                  <button
                    key={`${c.iso}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white font-bold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                      <span className={`text-[11px] font-mono ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>
                        {c.dialCode}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold">
                      {c.currency} ({c.currencySymbol})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Currency Selector (Manual Override) */}
      <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-violet-600" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Display Currency
              </h4>
              <p className="text-[11px] text-slate-400">
                Manual override available anytime
              </p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 text-xs font-bold">
            {activeCurrency.code} ({activeCurrency.symbol})
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {GLOBAL_CURRENCY_LIST.map((c) => {
            const isSelected = activeCurrency.code === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCurrencySelect(c.code)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/30'
                    : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-extrabold text-sm">{c.symbol}</span>
                  <span className="truncate">{c.code}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound Effects Toggle */}
      <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {soundActive ? (
              <Volume2 className="w-4 h-4 text-violet-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Audio Feedback
              </h4>
              <p className="text-[11px] text-slate-400">
                Play sound on tab switch and button taps
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const next = !soundActive;
              setSoundActive(next);
              setSoundEnabled(next);
              if (next) playTabSwitchSound();
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              soundActive ? 'bg-violet-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                soundActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Logout / Switch Account */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account or Reset Session</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-xl">
            <h4 className="font-bold text-slate-900 text-sm">
              Switch Account / Reset Session?
            </h4>
            <p className="text-xs text-slate-500">
              You will be signed out of this session. You can sign back in with your phone or Google anytime.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
