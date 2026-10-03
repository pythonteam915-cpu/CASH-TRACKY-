import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  incomeCount: number;
  expenseCount: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  incomeCount,
  expenseCount,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {/* Total Income Card */}
      <div className="relative group overflow-hidden rounded-3xl p-4 glass-card border border-emerald-200/60 shadow-sm transition-all duration-200 hover:border-emerald-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Income
          </span>
          <div className="w-7 h-7 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-lg sm:text-xl font-black tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalIncome)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{incomeCount} {incomeCount === 1 ? 'entry' : 'entries'}</span>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="relative group overflow-hidden rounded-3xl p-4 glass-card border border-rose-200/60 shadow-sm transition-all duration-200 hover:border-rose-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Expenses
          </span>
          <div className="w-7 h-7 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 shadow-xs">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-0.5">
          <p className="text-lg sm:text-xl font-black tracking-tight text-slate-900 tabular-nums">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>{expenseCount} {expenseCount === 1 ? 'entry' : 'entries'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
