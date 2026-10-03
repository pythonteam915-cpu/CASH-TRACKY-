import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile } from '../types/finance';
import {
  getOrCreateUserProfile,
  updateMonthlyBudget,
  updateUserCountryAndCurrency,
} from '../services/firebaseService';
import { CountryConfig, DEFAULT_COUNTRY, ALL_COUNTRIES } from '../data/countries';
import { setAppCurrency, getAppCurrency } from '../utils/formatters';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  activeCountry: CountryConfig;
  activeCurrency: { code: string; symbol: string };
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (
    phone: string,
    country: CountryConfig,
    displayName?: string
  ) => Promise<void>;
  updateCurrency: (currencyCode: string, currencySymbol?: string) => Promise<void>;
  updateCountry: (country: CountryConfig) => Promise<void>;
  signOut: () => Promise<void>;
  setBudgetGoal: (budget: number) => Promise<void>;
  isDemoMode: boolean;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROFILE = 'cashtracky_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Check saved local profile for persistent demo / phone session
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const [activeCountry, setActiveCountry] = useState<CountryConfig>(() => {
    if (userProfile?.countryCode) {
      const match = ALL_COUNTRIES.find((c) => c.iso === userProfile.countryCode);
      if (match) return match;
    }
    return DEFAULT_COUNTRY;
  });

  const [activeCurrency, setActiveCurrencyState] = useState<{ code: string; symbol: string }>(() => {
    const code = userProfile?.currency || DEFAULT_COUNTRY.currency;
    const symbol = userProfile?.currencySymbol || DEFAULT_COUNTRY.currencySymbol;
    setAppCurrency(code, symbol);
    return { code, symbol };
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync formatters whenever activeCurrency changes
  useEffect(() => {
    setAppCurrency(activeCurrency.code, activeCurrency.symbol);
  }, [activeCurrency]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getOrCreateUserProfile(
            user.uid,
            user.email || 'user@example.com',
            user.displayName || undefined,
            user.photoURL || undefined,
            {
              currency: activeCurrency.code,
              currencySymbol: activeCurrency.symbol,
              countryCode: activeCountry.iso,
              countryName: activeCountry.name,
              phone: userProfile?.phone,
            }
          );
          setUserProfile(profile);

          if (profile.currency) {
            const sym = profile.currencySymbol || '$';
            setActiveCurrencyState({ code: profile.currency, symbol: sym });
            setAppCurrency(profile.currency, sym);
          }
          if (profile.countryCode) {
            const countryMatch = ALL_COUNTRIES.find((c) => c.iso === profile.countryCode);
            if (countryMatch) setActiveCountry(countryMatch);
          }
        } catch (err) {
          console.error('Failed to load user profile from Firestore:', err);
        }
      } else {
        // If not logged in via Firebase, keep local profile if exists
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveProfileLocally = (profile: UserProfile | null) => {
    setUserProfile(profile);
    try {
      if (profile) {
        localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_PROFILE);
      }
    } catch {
      // Ignore
    }
  };

  /**
   * Phone Number Sign In / Sign Up with Automatic Country & Currency Detection
   */
  const signInWithPhone = async (
    phone: string,
    country: CountryConfig,
    displayName?: string
  ) => {
    setAuthError(null);
    try {
      // Configure country and currency immediately
      setActiveCountry(country);
      setActiveCurrencyState({
        code: country.currency,
        symbol: country.currencySymbol,
      });
      setAppCurrency(country.currency, country.currencySymbol);

      const userId = `phone-${country.iso.toLowerCase()}-${phone.replace(/\D/g, '').slice(-8)}`;
      const now = new Date().toISOString();

      const phoneProfile: UserProfile = {
        id: userId,
        email: `${phone.replace(/\D/g, '')}@phone.cashtracky.app`,
        phone,
        countryCode: country.iso,
        countryName: country.name,
        currency: country.currency,
        currencySymbol: country.currencySymbol,
        displayName: displayName || `${country.name} User`,
        monthlyBudget: 3500,
        createdAt: now,
        updatedAt: now,
      };

      saveProfileLocally(phoneProfile);

      // If Firebase is available and user is authenticated or guest doc can be created
      if (currentUser) {
        await updateUserCountryAndCurrency(currentUser.uid, {
          currency: country.currency,
          currencySymbol: country.currencySymbol,
          countryCode: country.iso,
          countryName: country.name,
          phone,
        });
      }
    } catch (err: any) {
      console.error('Phone Sign In Error:', err);
      setAuthError(err.message || 'Unable to sign in with phone.');
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const profile = await getOrCreateUserProfile(
          result.user.uid,
          result.user.email || 'user@example.com',
          result.user.displayName || undefined,
          result.user.photoURL || undefined,
          {
            currency: activeCurrency.code,
            currencySymbol: activeCurrency.symbol,
            countryCode: activeCountry.iso,
            countryName: activeCountry.name,
          }
        );
        saveProfileLocally(profile);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before finishing.');
      } else {
        setAuthError(err.message || 'Unable to sign in with Google.');
      }
    }
  };

  const updateCurrency = async (currencyCode: string, currencySymbol?: string) => {
    const symbolToUse =
      currencySymbol ||
      ALL_COUNTRIES.find((c) => c.currency === currencyCode)?.currencySymbol ||
      '$';

    setActiveCurrencyState({ code: currencyCode, symbol: symbolToUse });
    setAppCurrency(currencyCode, symbolToUse);

    const updatedProfile = userProfile
      ? { ...userProfile, currency: currencyCode, currencySymbol: symbolToUse }
      : null;
    saveProfileLocally(updatedProfile);

    if (currentUser) {
      await updateUserCountryAndCurrency(currentUser.uid, {
        currency: currencyCode,
        currencySymbol: symbolToUse,
      });
    }
  };

  const updateCountry = async (country: CountryConfig) => {
    setActiveCountry(country);
    await updateCurrency(country.currency, country.currencySymbol);

    const updatedProfile = userProfile
      ? {
          ...userProfile,
          countryCode: country.iso,
          countryName: country.name,
          currency: country.currency,
          currencySymbol: country.currencySymbol,
        }
      : null;
    saveProfileLocally(updatedProfile);

    if (currentUser) {
      await updateUserCountryAndCurrency(currentUser.uid, {
        currency: country.currency,
        currencySymbol: country.currencySymbol,
        countryCode: country.iso,
        countryName: country.name,
      });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    }
    saveProfileLocally(null);
  };

  const setBudgetGoal = async (budget: number) => {
    const updated = userProfile ? { ...userProfile, monthlyBudget: budget } : null;
    saveProfileLocally(updated);
    if (currentUser) {
      await updateMonthlyBudget(currentUser.uid, budget);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        activeCountry,
        activeCurrency,
        loading,
        signInWithGoogle,
        signInWithPhone,
        updateCurrency,
        updateCountry,
        signOut,
        setBudgetGoal,
        isDemoMode: !currentUser && !userProfile?.phone,
        authError,
        clearAuthError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
