import React, { useState, useEffect } from 'react';
import { X, Check, Tag, Store, Calendar, FileText, Plus } from 'lucide-react';
import { Transaction, TransactionCategory } from '../types/finance';
import { EXPENSE_CATEGORIES } from '../data/sampleData';
import { CategoryIcon } from './CategoryIcon';
import { getAppCurrency } from '../utils/formatters';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
  onClose: () => void;
  onSave: (updatedTx: Transaction) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  customCategories = [],
  onAddCustomCategory,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Dining & Drinks');
  const [date, setDate] = useState<string>('');
  const [merchant, setMerchant] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setTitle(transaction.title);
      setCategory(transaction.category);
      setDate(transaction.date);
      setMerchant(transaction.merchant || '');
      setNote(transaction.note || '');
      setError('');
      setIsCreatingCategory(false);
      setNewCatName('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

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

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }

    onSave({
      ...transaction,
      title: title.trim(),
      amount: numAmount,
      category,
      date,
      merchant: merchant.trim() || undefined,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Edit Expense
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Amount */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount
            </label>
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-bold text-violet-600">{getAppCurrency().symbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError('');
                }}
                className="w-40 text-center text-3xl font-extrabold bg-transparent text-slate-900 focus:outline-none tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title / Description
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
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

            {isCreatingCategory && (
              <div className="mb-2 p-2.5 rounded-2xl bg-violet-50 border border-violet-200 flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New category..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-xs text-slate-900 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1">
              {EXPENSE_CATEGORIES.map((cat) => {
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
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-violet-50 text-violet-800 border-violet-200 hover:bg-violet-100'
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

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Date
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-violet-500 focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-violet-500/25 flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
