import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Check, Sparkles, ArrowRight, ShieldCheck, Globe, KeyRound } from 'lucide-react';
import { CountryConfig, DEFAULT_COUNTRY, ALL_COUNTRIES } from '../data/countries';
import { PhoneCountryInput } from './PhoneCountryInput';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithPhone, signInWithGoogle, activeCountry, activeCurrency, authError, clearAuthError } = useAuth();

  const [authMethod, setAuthMethod] = useState<'phone' | 'google'>('phone');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryConfig>(activeCountry || DEFAULT_COUNTRY);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otpCode, setOtpCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 5) {
      setLocalError('Please enter a valid phone number.');
      return;
    }
    setLocalError('');
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError('');

    try {
      const fullPhone = `${selectedCountry.dialCode} ${phone.trim()}`;
      await signInWithPhone(fullPhone, selectedCountry, displayName.trim() || undefined);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setLocalError(err.message || 'Verification failed. Try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Mobile drag handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500" />
              <span>Smart Onboarding</span>
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Sign In to CASH TRACKY
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl my-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setStep('input');
              setLocalError('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-white text-violet-700 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-violet-600" />
            <span>Phone Number</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('google');
              setLocalError('');
            }}
            className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              authMethod === 'google'
                ? 'bg-white text-slate-900 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto space-y-4">
          {authMethod === 'phone' ? (
            step === 'input' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                {/* Phone Country Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Phone Number</span>
                    <span className="text-[10px] text-violet-600 font-semibold">
                      Auto-detects country & currency
                    </span>
                  </label>

                  <PhoneCountryInput
                    value={phone}
                    onChange={(newVal, country) => {
                      setPhone(newVal);
                      setSelectedCountry(country);
                      if (localError) setLocalError('');
                    }}
                    selectedCountry={selectedCountry}
                    onCountryChange={(c) => setSelectedCountry(c)}
                    autoFocus
                  />
                </div>

                {/* Name (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                {/* Real-time currency preview card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={selectedCountry.name}>
                      {selectedCountry.flag}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedCountry.name}
                      </p>
                      <p className="text-[11px] text-violet-700">
                        Default Currency: <strong>{selectedCountry.currency} ({selectedCountry.currencySymbol})</strong>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold">
                    Auto-set
                  </span>
                </div>

                {(localError || authError) && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                    {localError || authError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Continue with Phone</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* OTP Verification Step */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <p className="text-xs font-bold text-slate-800">
                    Verification Code Sent To
                  </p>
                  <p className="text-sm font-black text-violet-700 mt-0.5">
                    {selectedCountry.dialCode} {phone}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Demo Mode: Use code <strong className="text-slate-800">123456</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[0.5em] text-2xl font-black py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-violet-500 focus:bg-white tabular-nums"
                    autoFocus
                  />
                </div>

                {(localError || authError) && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                    {localError || authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg shadow-violet-500/25 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Verify & Access App</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Change phone number
                </button>
              </form>
            )
          ) : (
            /* Google Sign In option */
            <div className="space-y-4 py-2 text-center">
              <p className="text-xs text-slate-600">
                Sign in with your Google account to sync your expenses with Firebase Cloud Firestore.
              </p>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 shadow-sm flex items-center justify-center gap-3 active:scale-98 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {authError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {authError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
