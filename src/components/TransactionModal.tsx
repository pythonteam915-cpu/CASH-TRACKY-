import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Tag, FileText, Store, Plus, Sparkles } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
} from '../types/finance';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/sampleData';
import { CategoryIcon } from './CategoryIcon';
import { getAppCurrency } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  initialType: TransactionType;
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'formattedDate'>) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  initialType,
  customCategories = [],
  onAddCustomCategory,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Dining & Drinks');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Inline custom category
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setCategory(initialType === 'income' ? 'Salary' : 'Dining & Drinks');
      setAmount('');
      setTitle('');
      setMerchant('');
      setNote('');
      setError('');
      setIsCreatingCategory(false);
      setNewCatName('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialType]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'income' ? 'Salary' : 'Dining & Drinks');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    if (onAddCustomCategory) {
      onAddCustomCategory(trimmed);
    }
    setCategory(trimmed);
    setNewCatName('');
    setIsCreatingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a title or description.');
      return;
    }

    onSave({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      date,
      merchant: merchant.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  const defaultCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Add {type === 'expense' ? 'Expense' : 'Income'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Record a new financial entry for this month
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Segmented Type Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Income (+)
            </button>
          </div>

          {/* Amount Input */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-black text-violet-600">{getAppCurrency().symbol}</span>
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
                className="w-48 text-center text-4xl font-black bg-transparent text-slate-950 placeholder:text-slate-300 focus:outline-none tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Title / Description *
            </label>
            <input
              type="text"
              placeholder={type === 'expense' ? 'e.g. Blue Bottle Coffee' : 'e.g. Client Freelance Retainer'}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Category Selector with Custom Category Support */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Category
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

            {/* Inline Custom Creator */}
            {isCreatingCategory && (
              <div className="mb-2 p-2.5 rounded-2xl bg-violet-50/80 border border-violet-200 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs hover:bg-violet-700 cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1">
              {defaultCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setCategory(cat.name as TransactionCategory)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CategoryIcon
                        category={cat.name as TransactionCategory}
                        type={type}
                        size={13}
                      />
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
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
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

          {/* Date & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-blue-600" />
                <span>Merchant / Payer (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Target, Apple, Client"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Additional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 pb-1">
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 shadow-violet-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save {type === 'expense' ? 'Expense' : 'Income'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
