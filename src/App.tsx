/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_TRANSACTIONS } from './data/sampleData';
import { Transaction, TransactionType } from './types/finance';
import { Header } from './components/Header';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { BudgetGoalCard } from './components/BudgetGoalCard';
import { SmartInsightCard } from './components/SmartInsightCard';
import { SummaryCards } from './components/SummaryCards';
import { RecentTransactions } from './components/RecentTransactions';
import { TransactionModal } from './components/TransactionModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { AuthModal } from './components/AuthModal';
import { BottomNavigation, NavTab } from './components/BottomNavigation';

// Screens
import { ExpensesScreen } from './components/screens/ExpensesScreen';
import { AddScreen } from './components/screens/AddScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

// Auth and Firebase
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  subscribeToUserTransactions,
  saveUserTransaction,
  deleteUserTransaction,
  seedStarterTransactions,
  updateUserCustomCategories,
} from './services/firebaseService';
import { playTabSwitchSound } from './utils/soundEffects';
import { Smartphone, Monitor, RefreshCw } from 'lucide-react';

const INITIAL_CUSTOM_CATEGORIES = ['Pet Care', 'Education'];
const TABS: NavTab[] = ['home', 'expenses', 'add', 'analytics', 'profile'];

function AppContent() {
  const { currentUser, userProfile, setBudgetGoal, signOut } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Touch tracking for fluid mobile horizontal swipe gestures
  const touchStartX = React.useRef<number | null>(null);
  const touchStartY = React.useRef<number | null>(null);
  const touchEndX = React.useRef<number | null>(null);
  const touchEndY = React.useRef<number | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [localBudget, setLocalBudget] = useState<number>(3500);
  const [currency, setCurrency] = useState<string>('USD ($)');
  const [customCategories, setCustomCategories] = useState<string[]>(INITIAL_CUSTOM_CATEGORIES);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    // If a modal or bottom sheet is open, do not trigger tab switches
    if (modalOpen || selectedTransaction || editingTransaction || authModalOpen) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current === null ||
      touchEndX.current === null ||
      touchStartY.current === null ||
      touchEndY.current === null
    ) {
      return;
    }

    const deltaX = touchEndX.current - touchStartX.current;
    const deltaY = touchEndY.current - touchStartY.current;

    // Minimum swipe threshold 45px, horizontal intent must dominate vertical scroll by at least 1.3x
    const minSwipeDistance = 45;
    if (Math.abs(deltaX) > minSwipeDistance && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = TABS.indexOf(activeTab);
      if (deltaX < 0) {
        // Swiped Left -> switch to Next tab
        if (currentIndex < TABS.length - 1) {
          try {
            if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
              navigator.vibrate(10);
            }
          } catch {
            // Ignore
          }
          playTabSwitchSound();
          setSlideDirection('left');
          setActiveTab(TABS[currentIndex + 1]);
        }
      } else {
        // Swiped Right -> switch to Previous tab
        if (currentIndex > 0) {
          try {
            if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
              navigator.vibrate(10);
            }
          } catch {
            // Ignore
          }
          playTabSwitchSound();
          setSlideDirection('right');
          setActiveTab(TABS[currentIndex - 1]);
        }
      }
    }

    // Reset touch coordinates
    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTabChangeWithDirection = (newTab: NavTab) => {
    const currentIndex = TABS.indexOf(activeTab);
    const newIndex = TABS.indexOf(newTab);
    setSlideDirection(newIndex > currentIndex ? 'left' : 'right');
    setActiveTab(newTab);
  };

  // Sync with Firestore when logged in
  useEffect(() => {
    if (currentUser) {
      // Sync custom categories if existing on user profile
      if (userProfile?.customCategories && userProfile.customCategories.length > 0) {
        setCustomCategories(userProfile.customCategories);
      }

      const unsubscribe = subscribeToUserTransactions(
        currentUser.uid,
        (cloudTxs) => {
          if (cloudTxs.length === 0) {
            // Seed starter transactions if empty
            seedStarterTransactions(currentUser.uid, INITIAL_TRANSACTIONS);
            setTransactions(INITIAL_TRANSACTIONS);
          } else {
            setTransactions(cloudTxs);
          }
        },
        (error) => {
          console.warn('Firestore subscription notice:', error);
        }
      );

      return () => unsubscribe();
    }
  }, [currentUser, userProfile]);

  // Current active monthly budget
  const effectiveMonthlyBudget = userProfile?.monthlyBudget || localBudget;

  // Dynamic calculations for This Month
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') {
        income += tx.amount;
        incCount += 1;
      } else {
        expense += tx.amount;
        expCount += 1;
      }
    }

    return {
      totalIncome: income,
      totalExpenses: expense,
      remainingBalance: income - expense,
      incomeCount: incCount,
      expenseCount: expCount,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  // Handlers
  const handleOpenAdd = (type: TransactionType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleAddCustomCategory = async (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed || customCategories.includes(trimmed)) return;

    const updated = [...customCategories, trimmed];
    setCustomCategories(updated);

    if (currentUser) {
      await updateUserCustomCategories(currentUser.uid, updated);
    }
  };

  const handleSaveTransaction = async (newTxData: Omit<Transaction, 'id' | 'formattedDate'>) => {
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      formattedDate: 'Just now',
    };

    if (currentUser) {
      await saveUserTransaction(currentUser.uid, newTx);
    } else {
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleUpdateExistingTransaction = async (updatedTx: Transaction) => {
    if (currentUser) {
      await saveUserTransaction(currentUser.uid, updatedTx);
    } else {
      setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (currentUser) {
      await deleteUserTransaction(currentUser.uid, id);
    } else {
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  const handleUpdateBudget = async (newBudget: number) => {
    setLocalBudget(newBudget);
    if (currentUser) {
      await setBudgetGoal(newBudget);
    }
  };

  const handleResetSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setLocalBudget(3500);
    setCustomCategories(INITIAL_CUSTOM_CATEGORIES);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    if (currentUser) {
      await signOut();
    }
    handleResetSampleData();
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-[#f6f8fd] text-slate-800 flex flex-col items-center justify-start relative overflow-x-hidden font-sans touch-pan-y select-none transition-colors duration-200"
    >
      {/* Dynamic Ambient Prism Lighting Layers */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-violet-200/40 via-blue-200/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-1/4 w-80 h-80 bg-pink-300/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Top Utility Bar with Swipe Indicator */}
      <div className="w-full max-w-md px-4 pt-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {/* Visual Tab Swipe Indicator Dots */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200/70" title="Swipe left/right to change tabs">
            {TABS.map((tab) => (
              <span
                key={tab}
                className={`transition-all duration-300 rounded-full ${
                  activeTab === tab
                    ? 'w-3.5 h-1.5 bg-violet-600'
                    : 'w-1.5 h-1.5 bg-slate-400/60'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-700 capitalize">
            {activeTab}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetSampleData}
            title="Reset to default sample data"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px] shadow-2xs"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Reset Demo</span>
          </button>
          <button
            type="button"
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            title="Toggle mobile device frame preview"
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px] shadow-2xs"
          >
            {deviceFrameMode ? (
              <>
                <Monitor className="w-3 h-3 text-violet-600" />
                <span>Fluid</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-violet-600" />
                <span>Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container: Mobile-First Responsive Frame */}
      <main
        className={`w-full transition-all duration-300 pb-28 ${
          deviceFrameMode
            ? 'max-w-[420px] my-3 rounded-[40px] border-8 border-slate-800 shadow-[0_20px_60px_-15px_rgba(99,102,241,0.25)] bg-[#f6f8fd] p-5 overflow-hidden min-h-[820px] relative'
            : 'max-w-md px-4 sm:px-5 py-2'
        }`}
      >
        {/* Device Notch / Speaker when phone frame is active */}
        {deviceFrameMode && (
          <div className="w-28 h-4 bg-slate-300/80 rounded-full mx-auto mb-3 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-400 rounded-full"></div>
          </div>
        )}

        {/* Top Header */}
        <Header
          currentMonth="October"
          year={2026}
          onOpenAuth={() => setAuthModalOpen(true)}
        />

        {/* Tab 1: HOME SCREEN */}
        {activeTab === 'home' && (
          <div
            key="tab-home"
            className={`space-y-0 animate-in fade-in duration-200 ${
              slideDirection === 'left' ? 'slide-in-from-right-4' : slideDirection === 'right' ? 'slide-in-from-left-4' : ''
            }`}
          >
            {/* Remaining Balance card with Add Expense & Add Income */}
            <HeroBalanceCard
              balance={summary.remainingBalance}
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              onAddExpense={() => handleOpenAdd('expense')}
              onAddIncome={() => handleOpenAdd('income')}
            />

            {/* Monthly Budget Goal card with Progress Bar */}
            <BudgetGoalCard
              monthlyBudget={effectiveMonthlyBudget}
              totalExpenses={summary.totalExpenses}
              onUpdateBudget={handleUpdateBudget}
              isCloudSynced={Boolean(currentUser)}
            />

            {/* Smart Spending Insights (Factual local intelligence) */}
            <SmartInsightCard
              transactions={transactions}
              monthlyBudget={effectiveMonthlyBudget}
            />

            {/* Total Income & Total Expenses Cards */}
            <SummaryCards
              totalIncome={summary.totalIncome}
              totalExpenses={summary.totalExpenses}
              incomeCount={summary.incomeCount}
              expenseCount={summary.expenseCount}
            />

            {/* Recent Transactions Section */}
            <RecentTransactions
              transactions={transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onAddTransaction={(type) => handleOpenAdd(type)}
            />
          </div>
        )}

        {/* Tab 2: EXPENSES SCREEN */}
        {activeTab === 'expenses' && (
          <div
            key="tab-expenses"
            className={`animate-in fade-in duration-200 ${
              slideDirection === 'left' ? 'slide-in-from-right-4' : slideDirection === 'right' ? 'slide-in-from-left-4' : ''
            }`}
          >
            <ExpensesScreen
              transactions={transactions}
              customCategories={customCategories}
              onEditExpense={(tx) => setEditingTransaction(tx)}
              onDeleteExpense={handleDeleteTransaction}
              onOpenAddExpense={() => handleOpenAdd('expense')}
            />
          </div>
        )}

        {/* Tab 3: ADD SCREEN */}
        {activeTab === 'add' && (
          <div
            key="tab-add"
            className={`animate-in fade-in duration-200 ${
              slideDirection === 'left' ? 'slide-in-from-right-4' : slideDirection === 'right' ? 'slide-in-from-left-4' : ''
            }`}
          >
            <AddScreen
              customCategories={customCategories}
              onAddCustomCategory={handleAddCustomCategory}
              onSaveTransaction={handleSaveTransaction}
              onSuccess={() => handleTabChangeWithDirection('home')}
            />
          </div>
        )}

        {/* Tab 4: ANALYTICS SCREEN */}
        {activeTab === 'analytics' && (
          <div
            key="tab-analytics"
            className={`animate-in fade-in duration-200 ${
              slideDirection === 'left' ? 'slide-in-from-right-4' : slideDirection === 'right' ? 'slide-in-from-left-4' : ''
            }`}
          >
            <AnalyticsScreen
              transactions={transactions}
              monthlyBudget={effectiveMonthlyBudget}
              customCategories={customCategories}
            />
          </div>
        )}

        {/* Tab 5: PROFILE SCREEN */}
        {activeTab === 'profile' && (
          <div
            key="tab-profile"
            className={`animate-in fade-in duration-200 ${
              slideDirection === 'left' ? 'slide-in-from-right-4' : slideDirection === 'right' ? 'slide-in-from-left-4' : ''
            }`}
          >
            <ProfileScreen
              userName={currentUser?.displayName || 'Alex Morgan'}
              userEmail={currentUser?.email || 'alex.morgan@cashtracky.app'}
              currency={currency}
              onCurrencyChange={setCurrency}
              onLogout={handleLogout}
              monthlyBudget={effectiveMonthlyBudget}
              onOpenAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* REQUIRED: Fixed Bottom Navigation Bar (Always Visible) */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChangeWithDirection}
      />

      {/* International Phone & Account Auth Modal with Country/Currency Detection */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Quick Add Transaction Modal (triggered from buttons in Home) */}
      <TransactionModal
        isOpen={modalOpen}
        initialType={modalType}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTransaction}
      />

      {/* Transaction Detail View Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={handleDeleteTransaction}
      />

      {/* Edit Expense Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={Boolean(editingTransaction)}
        customCategories={customCategories}
        onAddCustomCategory={handleAddCustomCategory}
        onClose={() => setEditingTransaction(null)}
        onSave={handleUpdateExistingTransaction}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
