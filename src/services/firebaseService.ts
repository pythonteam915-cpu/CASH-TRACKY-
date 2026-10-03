import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Transaction, UserProfile } from '../types/finance';

const USERS_COLLECTION = 'users';
const DEFAULT_MONTHLY_BUDGET = 3500;

/**
 * Fetch or initialize the user profile document in Firestore
 */
export async function getOrCreateUserProfile(
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string,
  extraProfileData?: {
    phone?: string;
    countryCode?: string;
    countryName?: string;
    currency?: string;
    currencySymbol?: string;
  }
): Promise<UserProfile> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const path = `${USERS_COLLECTION}/${userId}`;

  try {
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      const updatedProfile: UserProfile = {
        id: userId,
        email: data.email || email,
        displayName: data.displayName || displayName || '',
        photoURL: data.photoURL || photoURL || '',
        monthlyBudget: typeof data.monthlyBudget === 'number' ? data.monthlyBudget : DEFAULT_MONTHLY_BUDGET,
        customCategories: Array.isArray(data.customCategories) ? data.customCategories : [],
        phone: data.phone || extraProfileData?.phone,
        countryCode: data.countryCode || extraProfileData?.countryCode || 'US',
        countryName: data.countryName || extraProfileData?.countryName || 'United States',
        currency: data.currency || extraProfileData?.currency || 'USD',
        currencySymbol: data.currencySymbol || extraProfileData?.currencySymbol || '$',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      // If extra phone or currency info was passed and wasn't in doc, persist it
      if (
        extraProfileData?.currency &&
        (!data.currency || !data.phone)
      ) {
        await updateDoc(userRef, {
          ...(extraProfileData.phone ? { phone: extraProfileData.phone } : {}),
          ...(extraProfileData.countryCode ? { countryCode: extraProfileData.countryCode } : {}),
          ...(extraProfileData.countryName ? { countryName: extraProfileData.countryName } : {}),
          ...(extraProfileData.currency ? { currency: extraProfileData.currency } : {}),
          ...(extraProfileData.currencySymbol ? { currencySymbol: extraProfileData.currencySymbol } : {}),
          updatedAt: new Date().toISOString(),
        });
      }

      return updatedProfile;
    } else {
      const now = new Date().toISOString();
      const newProfile: UserProfile = {
        id: userId,
        email,
        displayName: displayName || '',
        photoURL: photoURL || '',
        monthlyBudget: DEFAULT_MONTHLY_BUDGET,
        customCategories: [],
        phone: extraProfileData?.phone || '',
        countryCode: extraProfileData?.countryCode || 'US',
        countryName: extraProfileData?.countryName || 'United States',
        currency: extraProfileData?.currency || 'USD',
        currencySymbol: extraProfileData?.currencySymbol || '$',
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    throw error;
  }
}

/**
 * Update the user's country and currency preferences
 */
export async function updateUserCountryAndCurrency(
  userId: string,
  data: {
    currency: string;
    currencySymbol: string;
    countryCode?: string;
    countryName?: string;
    phone?: string;
  }
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const path = `${USERS_COLLECTION}/${userId}`;

  try {
    await updateDoc(userRef, {
      currency: data.currency,
      currencySymbol: data.currencySymbol,
      ...(data.countryCode ? { countryCode: data.countryCode } : {}),
      ...(data.countryName ? { countryName: data.countryName } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update the user's custom categories
 */
export async function updateUserCustomCategories(
  userId: string,
  customCategories: string[]
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const path = `${USERS_COLLECTION}/${userId}`;

  try {
    await updateDoc(userRef, {
      customCategories,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update the user's monthly budget goal
 */
export async function updateMonthlyBudget(userId: string, monthlyBudget: number): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const path = `${USERS_COLLECTION}/${userId}`;

  try {
    await updateDoc(userRef, {
      monthlyBudget,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribe to the user's transactions subcollection
 */
export function subscribeToUserTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const path = `${USERS_COLLECTION}/${userId}/transactions`;
  const q = collection(db, USERS_COLLECTION, userId, 'transactions');

  return onSnapshot(
    q,
    (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        txs.push({
          id: docSnap.id,
          title: data.title,
          amount: data.amount,
          type: data.type,
          category: data.category,
          date: data.date,
          formattedDate: data.formattedDate || data.date,
          merchant: data.merchant,
          note: data.note,
        });
      });
      // Sort newest first
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(txs);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      if (onError) onError(error);
    }
  );
}

/**
 * Save (create or update) a transaction
 */
export async function saveUserTransaction(userId: string, tx: Transaction): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}/transactions/${tx.id}`;
  const txRef = doc(db, USERS_COLLECTION, userId, 'transactions', tx.id);

  try {
    await setDoc(txRef, {
      id: tx.id,
      userId,
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
      formattedDate: tx.formattedDate || tx.date,
      merchant: tx.merchant || null,
      note: tx.note || null,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a user's transaction
 */
export async function deleteUserTransaction(userId: string, txId: string): Promise<void> {
  const path = `${USERS_COLLECTION}/${userId}/transactions/${txId}`;
  const txRef = doc(db, USERS_COLLECTION, userId, 'transactions', txId);

  try {
    await deleteDoc(txRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Seed user account with realistic starter data if starting empty
 */
export async function seedStarterTransactions(
  userId: string,
  sampleTransactions: Transaction[]
): Promise<void> {
  for (const sample of sampleTransactions) {
    await saveUserTransaction(userId, sample);
  }
}
