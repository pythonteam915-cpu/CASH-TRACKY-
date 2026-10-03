export type TransactionType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Housing'
  | 'Groceries'
  | 'Dining & Drinks'
  | 'Transport'
  | 'Entertainment'
  | 'Shopping'
  | 'Health & Fitness'
  | 'Subscriptions'
  | 'Utilities'
  | 'Travel'
  | 'Other Expense';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Bonus'
  | 'Gifts & Cash'
  | 'Other Income';

export type TransactionCategory = ExpenseCategory | IncomeCategory | string;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO date string YYYY-MM-DD
  formattedDate?: string;
  note?: string;
  merchant?: string;
}

export interface MonthSummary {
  monthName: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  currencySymbol: string;
  transactionCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  countryCode?: string; // ISO e.g. "IN", "SA", "AE", "US"
  countryName?: string; // e.g. "India", "Saudi Arabia"
  currency?: string; // e.g. "INR", "SAR", "AED", "USD"
  currencySymbol?: string; // e.g. "₹", "﷼", "د.إ", "$"
  displayName?: string;
  photoURL?: string;
  monthlyBudget: number;
  customCategories?: string[];
  createdAt?: string;
  updatedAt?: string;
}
