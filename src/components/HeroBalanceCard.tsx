import React from 'react';
import { Plus, Minus, Sparkles, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface HeroBalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  onAddExpense: () => void;
  onAddIncome: () => void;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  balance,
  totalIncome,
  totalExpenses,
  onAddExpense,
  onAddIncome,
}) => {
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
  const isPositive = balance >= 0;

  return (
    <div className="relative group w-full mb-4">
      {/* Ambient background glow orbs */}
      <div className="absolute -top-6 -left-6 w-36 h-36 bg-violet-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Glass-Prism Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 glass-prism-hero transition-all duration-300">
        {/* Specular Prism Highlights */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent"></div>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-bl from-pink-400/20 via-blue-400/15 to-transparent rounded-full blur-xl pointer-events-none"></div>

        {/* Card Header Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-violet-700 shadow-inner">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-violet-800 uppercase">
                Remaining Balance
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>Net Cash Flow</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-600 font-semibold">Safe to spend</span>
              </div>
            </div>
          </div>

          {/* Savings Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 border border-violet-200 text-[11px] font-bold text-violet-800 shadow-xs">
            <Sparkles className="w-3 h-3 text-pink-500" />
            <span>{savingsRate}% Saved</span>
          </div>
        </div>

        {/* Big Balance Amount */}
        <div className="mt-3.5 mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight tabular-nums ${
                isPositive
                  ? 'text-slate-950'
                  : 'text-rose-600'
              }`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total income minus all current expenses
          </p>
        </div>

        {/* Action Buttons: Add Expense and Add Income */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Add Expense Button */}
          <button
            type="button"
            onClick={onAddExpense}
            className="group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover/btn:bg-rose-100 transition-colors">
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="tracking-tight">Add Expense</span>
          </button>

          {/* Add Income Button */}
          <button
            type="button"
            onClick={onAddIncome}
            className="group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all duration-200 active:scale-[0.98] shadow-md shadow-violet-500/25 border border-white/20 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-white group-hover/btn:bg-white/30 transition-colors">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="tracking-tight">Add Income</span>
          </button>
        </div>
      </div>
    </div>
  );
};
