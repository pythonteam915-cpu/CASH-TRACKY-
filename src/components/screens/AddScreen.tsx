import React, { useState } from 'react';
import { Transaction, TransactionType, TransactionCategory } from '../../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../data/sampleData';
import { CategoryIcon } from '../CategoryIcon';
import { Minus, Plus, Check, Calendar, Tag, FileText, Store, Sparkles, X } from 'lucide-react';
import { getAppCurrency } from '../../utils/formatters';

interface AddScreenProps {
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
  onSaveTransaction: (tx: Omit<Transaction, 'id' | 'formattedDate'>) => void;
  onSuccess: () => void;
}

export const AddScreen: React.FC<AddScreenProps> = ({
  customCategories = [],
  onAddCustomCategory,
  onSaveTransaction,
  onSuccess,
}) => {
  const [activeChoice, setActiveChoice] = useState<TransactionType>('expense');

  // Form states
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Dining & Drinks');
  const [source, setSource] = useState<string>(''); // For income: Source
  const [expenseTitle, setExpenseTitle] = useState<string>(''); // For expense: Title / item
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // New Custom Category inline creator
  const [isCreatingCategory, setIsCreatingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categoryError, setCategoryError] = useState<string>('');

  const handleChoiceChange = (choice: TransactionType) => {
    setActiveChoice(choice);
    setCategory(choice === 'expense' ? 'Dining & Drinks' : 'Salary');
    setError('');
  };

  const handleCreateCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryError('Category name cannot be empty.');
      return;
    }
    if (trimmed.length > 32) {
      setCategoryError('Name must be 32 characters or fewer.');
      return;
    }

    if (onAddCustomCategory) {
      onAddCustomCategory(trimmed);
    }
    setCategory(trimmed);
    setNewCategoryName('');
    setIsCreatingCategory(false);
    setCategoryError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }

    const titleToUse =
      activeChoice === 'expense'
        ? expenseTitle.trim() || `${category} Expense`
        : source.trim() || `${category} Income`;

    onSaveTransaction({
      title: titleToUse,
      amount: numAmount,
      type: activeChoice,
      category,
      date,
      merchant: activeChoice === 'income' ? source.trim() : expenseTitle.trim(),
      note: note.trim() || undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      onSuccess();
    }, 600);
  };

  const defaultCategories = activeChoice === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
          New Entry
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Add Transaction
        </h2>
      </div>

      {/* Choice Segmented Toggle: Add Expense vs Add Income */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-200/60 rounded-3xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleChoiceChange('expense')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeChoice === 'expense'
              ? 'bg-white text-rose-600 shadow-md shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeChoice === 'expense' ? 'bg-rose-100 text-rose-600' : 'bg-slate-300 text-slate-600'
            }`}
          >
            <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Add Expense</span>
        </button>

        <button
          type="button"
          onClick={() => handleChoiceChange('income')}
          className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeChoice === 'income'
              ? 'bg-white text-emerald-600 shadow-md shadow-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeChoice === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-300 text-slate-600'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>Add Income</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="rounded-3xl glass-card border border-slate-200/80 p-5 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount Display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-extrabold text-violet-600">{getAppCurrency().symbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-48 text-center text-4xl font-black bg-transparent text-slate-900 placeholder:text-slate-300 focus:outline-none tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Conditional field: Category or Source */}
          {activeChoice === 'expense' ? (
            /* ADD EXPENSE FIELDS */
            <>
              {/* Category Picker with Custom Category Addition */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-violet-600" />
                    <span>Category</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>{isCreatingCategory ? 'Close' : 'Custom Category'}</span>
                  </button>
                </div>

                {/* Inline Custom Category Creator */}
                {isCreatingCategory && (
                  <div className="mb-2 p-3 rounded-2xl bg-violet-50/80 border border-violet-200 animate-in fade-in duration-150">
                    <p className="text-[11px] font-bold text-violet-800 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-pink-500" />
                      <span>Add New User-Defined Category</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Pet Care, Gaming, Side Project"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          if (categoryError) setCategoryError('');
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCustomCategory}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs shadow-xs hover:bg-violet-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {categoryError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {categoryError}
                      </p>
                    )}
                  </div>
                )}

                {/* Grid of Default + Custom Categories */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {/* Default Categories */}
                  {defaultCategories.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name as TransactionCategory)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <CategoryIcon category={cat.name as TransactionCategory} type="expense" size={13} />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}

                  {/* User-defined custom categories */}
                  {customCategories.map((customCat) => {
                    const isSelected = category === customCat;
                    return (
                      <button
                        key={customCat}
                        type="button"
                        onClick={() => setCategory(customCat)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                            : 'bg-violet-50/60 text-violet-800 border-violet-200 hover:bg-violet-100/60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-violet-200 text-violet-700'
                          }`}
                        >
                          <Tag size={13} />
                        </div>
                        <span className="truncate">{customCat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Merchant */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-violet-600" />
                  <span>Expense Description / Merchant</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blue Bottle Coffee, Target, Uber"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
                />
              </div>
            </>
          ) : (
            /* ADD INCOME FIELDS */
            <>
              {/* Source */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Income Source *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tech Corp Salary, Freelance Design, Dividend"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              {/* Category with Custom Category option */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Category</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                    <span>{isCreatingCategory ? 'Close' : 'Custom Category'}</span>
                  </button>
                </div>

                {isCreatingCategory && (
                  <div className="mb-2 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 animate-in fade-in duration-150">
                    <p className="text-[11px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Add New Income Category</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. Consulting, Royalties, Staking"
                        value={newCategoryName}
                        onChange={(e) => {
                          setNewCategoryName(e.target.value);
                          if (categoryError) setCategoryError('');
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCustomCategory}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    {categoryError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1">
                        {categoryError}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {defaultCategories.map((cat) => {
                    const isSelected = category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setCategory(cat.name as TransactionCategory)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <CategoryIcon category={cat.name as TransactionCategory} type="income" size={13} />
                        </div>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}

                  {/* Custom categories */}
                  {customCategories.map((customCat) => {
                    const isSelected = category === customCat;
                    return (
                      <button
                        key={customCat}
                        type="button"
                        onClick={() => setCategory(customCat)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-emerald-50/60 text-emerald-800 border-emerald-200 hover:bg-emerald-100/60'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-700'
                          }`}
                        >
                          <Tag size={13} />
                        </div>
                        <span className="truncate">{customCat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Note (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Additional notes, tags or details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitted}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                activeChoice === 'expense'
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 hover:brightness-105 shadow-violet-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 shadow-emerald-500/25'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{activeChoice === 'expense' ? 'Save Expense' : 'Save Income'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
