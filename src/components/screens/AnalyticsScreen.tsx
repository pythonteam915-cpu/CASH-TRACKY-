import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon, getCategoryStyles } from '../CategoryIcon';
import {
  PieChart,
  TrendingDown,
  Layers,
  Filter,
  Sparkles,
  Tag,
  CheckCircle2,
  Receipt,
  X,
  ArrowRight,
} from 'lucide-react';

interface AnalyticsScreenProps {
  transactions: Transaction[];
  monthlyBudget: number;
  customCategories?: string[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  transactions,
  monthlyBudget,
  customCategories = [],
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const categoryTotals: { [category: string]: number } = {};
  const categoryCounts: { [category: string]: number } = {};

  for (const exp of expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    categoryCounts[exp.category] = (categoryCounts[exp.category] || 0) + 1;
  }

  // Combined list of all available categories (existing expense categories + any custom categories)
  const allCategoryNames = Array.from(
    new Set([...Object.keys(categoryTotals), ...customCategories])
  );

  // Ranked categories
  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      count: categoryCounts[cat] || 0,
      percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
      isCustom: customCategories.includes(cat),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Filtered transactions if a category is selected
  const isFiltered = selectedCategoryFilter !== 'all';
  const filteredCategoryExpenses = isFiltered
    ? expenses.filter((t) => t.category === selectedCategoryFilter)
    : expenses;

  const selectedCategoryTotal = isFiltered
    ? categoryTotals[selectedCategoryFilter] || 0
    : totalExpense;

  const selectedCategoryPercentage =
    totalExpense > 0 && isFiltered ? (selectedCategoryTotal / totalExpense) * 100 : 100;

  // Visual bar gradient colors
  const barColors = [
    'from-violet-600 to-indigo-600',
    'from-blue-500 to-cyan-500',
    'from-fuchsia-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-teal-500',
    'from-purple-500 to-rose-500',
    'from-sky-500 to-blue-600',
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
            Insights & Trends
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Analytics
          </h2>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold hover:bg-violet-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills (includes custom categories) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-violet-600" />
            <span>Filter by Category</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {allCategoryNames.length} categories available
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {/* 'All' option */}
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === 'all'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>

          {/* Active expense categories & custom categories */}
          {allCategoryNames.map((cat) => {
            const isSelected = selectedCategoryFilter === cat;
            const isCustom = customCategories.includes(cat);
            const amount = categoryTotals[cat] || 0;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/30'
                    : isCustom
                    ? 'bg-violet-50/80 text-violet-900 border-violet-200 hover:bg-violet-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {amount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </span>
                )}
                {isCustom && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" title="Custom Category" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Metric Card: Adapts when filtering by a specific category */}
      <div className="relative overflow-hidden rounded-3xl p-5 glass-prism-hero border border-violet-200/60 shadow-lg shadow-violet-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-violet-600">
              {isFiltered ? (
                <CategoryIcon category={selectedCategoryFilter} type="expense" size={16} />
              ) : (
                <TrendingDown className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                {isFiltered ? `${selectedCategoryFilter} Total` : 'Total Monthly Expenses'}
              </span>
              {isFiltered && customCategories.includes(selectedCategoryFilter) && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 text-[9px] font-bold">
                  Custom
                </span>
              )}
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">October 2026</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {formatCurrency(selectedCategoryTotal)}
          </span>
          {isFiltered && totalExpense > 0 && (
            <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
              {selectedCategoryPercentage.toFixed(1)}% of all spending
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60 text-slate-500">
          <span>
            {isFiltered
              ? `${filteredCategoryExpenses.length} ${filteredCategoryExpenses.length === 1 ? 'transaction' : 'transactions'}`
              : `Overall Budget: ${formatCurrency(monthlyBudget)}`}
          </span>
          <span className="font-semibold text-violet-600">
            {isFiltered
              ? `${((selectedCategoryTotal / (monthlyBudget || 1)) * 100).toFixed(1)}% of total budget`
              : `${((totalExpense / (monthlyBudget || 1)) * 100).toFixed(0)}% utilized`}
          </span>
        </div>
      </div>

      {/* Category-Specific Drilldown View when a category is selected */}
      {isFiltered ? (
        <div className="space-y-3">
          <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-violet-600" />
                <span>Transactions in "{selectedCategoryFilter}"</span>
              </h3>
              <span className="text-xs text-slate-400 tabular-nums">
                ({filteredCategoryExpenses.length})
              </span>
            </div>

            {filteredCategoryExpenses.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-700">No expenses in this category yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  You can assign this category when adding new expenses.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCategoryExpenses.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {tx.formattedDate || tx.date}
                        {tx.note && ` · "${tx.note}"`}
                      </p>
                    </div>

                    <span className="text-xs font-black text-slate-900 tabular-nums shrink-0">
                      -{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Overall Analytics View when 'All' is selected */
        <>
          {/* Proportional Distribution Bar */}
          <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Spending Distribution
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {sortedCategories.length} active categories
              </span>
            </div>

            {/* Multi-segment horizontal bar */}
            <div className="h-4 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 border border-slate-200">
              {sortedCategories.map((item, idx) => (
                <div
                  key={item.category}
                  className={`h-full bg-gradient-to-r ${barColors[idx % barColors.length]} first:rounded-l-full last:rounded-r-full transition-all duration-500 cursor-pointer hover:opacity-90`}
                  style={{ width: `${Math.max(2, item.percentage)}%` }}
                  onClick={() => setSelectedCategoryFilter(item.category)}
                  title={`${item.category}: ${item.percentage.toFixed(1)}% (click to filter)`}
                />
              ))}
            </div>

            {/* Quick Legend Tags (Clicking a tag filters by it!) */}
            <div className="flex flex-wrap gap-2 pt-1">
              {sortedCategories.slice(0, 5).map((item, idx) => (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(item.category)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-violet-700 cursor-pointer"
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${barColors[idx % barColors.length]}`} />
                  <span className="truncate max-w-[85px]">{item.category}</span>
                  <span className="font-bold text-slate-900">{item.percentage.toFixed(0)}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Breakdown List */}
          <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Category Breakdown
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Click row to filter</span>
            </div>

            <div className="space-y-3">
              {sortedCategories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No expense data recorded to analyze yet.
                </p>
              ) : (
                sortedCategories.map((cat, idx) => {
                  const colorGrad = barColors[idx % barColors.length];

                  return (
                    <button
                      key={cat.category}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat.category)}
                      className="w-full text-left space-y-1.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center text-violet-700">
                            <CategoryIcon category={cat.category as any} type="expense" size={13} />
                          </div>
                          <span className="font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                            {cat.category}
                          </span>
                          {cat.isCustom && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-pink-100 text-pink-700 font-bold">
                              Custom
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 tabular-nums">
                            {formatCurrency(cat.amount)}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 tabular-nums w-12 text-right">
                            {cat.percentage.toFixed(1)}%
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      {/* Progress bar per category */}
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colorGrad} transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
