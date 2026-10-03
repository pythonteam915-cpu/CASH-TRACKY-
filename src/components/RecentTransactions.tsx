import React, { useState } from 'react';
import { ChevronRight, Inbox } from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { CategoryIcon, getCategoryStyles } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onAddTransaction: (type: TransactionType) => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onSelectTransaction,
  onAddTransaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="w-full pb-4">
      {/* Section Header with Segmented Filter Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Recent Transactions</span>
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              ({filteredTransactions.length})
            </span>
          </h3>
        </div>

        {/* Functional Interactive Segmented Filter */}
        <div className="flex items-center p-1 bg-slate-200/60 rounded-xl backdrop-blur-md self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-violet-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('expense')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setFilter('income')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center rounded-3xl glass-card border border-slate-200/80 my-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Inbox className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-bold text-slate-800">No transactions found</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {filter === 'all'
              ? 'Start by recording your first income or expense for this month.'
              : `No ${filter} entries recorded yet for this period.`}
          </p>
          <button
            type="button"
            onClick={() => onAddTransaction(filter === 'income' ? 'income' : 'expense')}
            className="mt-4 px-4 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 text-xs font-bold text-violet-700 transition-colors cursor-pointer"
          >
            + Add {filter === 'income' ? 'Income' : 'Expense'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <button
                key={tx.id}
                type="button"
                onClick={() => onSelectTransaction(tx)}
                className="w-full text-left p-3.5 rounded-2xl glass-card border border-slate-200/70 hover:border-violet-300 shadow-xs hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-3 group active:scale-[0.99] cursor-pointer"
              >
                {/* Left: Category Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-violet-100 text-violet-700 border border-violet-200'
                    } flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105`}
                  >
                    <CategoryIcon category={tx.category} type={tx.type} size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                      {tx.title}
                    </p>
                    {/* Clean unboxed metadata with dot separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{tx.category}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="truncate">{tx.formattedDate || tx.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p
                      className={`text-sm sm:text-base font-extrabold tabular-nums ${
                        isIncome ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {isIncome ? 'Income' : 'Expense'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
