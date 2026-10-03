import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { CategoryIcon, getCategoryStyles } from '../CategoryIcon';
import { formatCurrency } from '../../utils/formatters';
import { Edit2, Trash2, Search, Filter, ArrowUpRight, Plus, Receipt } from 'lucide-react';

interface ExpensesScreenProps {
  transactions: Transaction[];
  customCategories?: string[];
  onEditExpense: (tx: Transaction) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: () => void;
}

export const ExpensesScreen: React.FC<ExpensesScreenProps> = ({
  transactions,
  customCategories = [],
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const expenses = transactions.filter((tx) => tx.type === 'expense');

  // Calculate monthly expense total
  const totalExpenseAmount = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  // Available categories in expenses + any custom categories
  const categories = Array.from(new Set([...expenses.map((tx) => tx.category), ...customCategories]));

  // Filtered expenses
  const filteredExpenses = expenses.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.merchant && tx.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-4">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
            Records & History
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Expenses
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-violet-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Monthly Expense Total Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 glass-prism-hero border border-violet-200/60 shadow-lg shadow-violet-500/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center text-violet-600">
              <Receipt className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Monthly Expense Total
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold tabular-nums">
            {expenses.length} total
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatCurrency(totalExpenseAmount)}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-1">
          Accumulated spending for the current active month
        </p>
      </div>

      {/* Search and Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by title or store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/80 border border-slate-200/80 text-slate-800 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white shadow-sm transition-all"
          />
        </div>

        {/* Category Pills */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                  : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              All ({expenses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                    : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Expense List */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center rounded-3xl glass-card border border-slate-200/80 my-3">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search query or category filter.'
                : 'You have not added any expenses yet.'}
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const style = getCategoryStyles(expense.category, 'expense');

            return (
              <div
                key={expense.id}
                className="p-3.5 rounded-2xl glass-card border border-slate-200/70 hover:border-violet-300 shadow-sm transition-all duration-150 flex items-center justify-between gap-3 group"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-violet-100/70 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 shadow-sm">
                    <CategoryIcon category={expense.category} type="expense" size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {expense.title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="font-medium text-violet-600">{expense.category}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="truncate">{expense.formattedDate || expense.date}</span>
                    </div>
                    {expense.note && (
                      <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
                        "{expense.note}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions (Edit + Delete) */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tabular-nums">
                    -{formatCurrency(expense.amount)}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => onEditExpense(expense)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-violet-100 text-slate-500 hover:text-violet-700 transition-colors cursor-pointer"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
