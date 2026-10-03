import React from 'react';
import { X, Trash2, Calendar, Store, Tag, FileText } from 'lucide-react';
import { Transaction } from '../types/finance';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDelete,
}) => {
  if (!transaction) return null;

  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 z-10 animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Transaction Details
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Amount Card */}
        <div className="my-5 p-5 rounded-3xl glass-prism-hero text-center relative overflow-hidden border border-violet-200/80">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 bg-violet-100 text-violet-700 shadow-sm border border-violet-200">
            <CategoryIcon category={transaction.category} type={transaction.type} size={24} />
          </div>

          <h4 className="text-lg font-black text-slate-900 tracking-tight">
            {transaction.title}
          </h4>

          <p
            className={`text-3xl font-black mt-2 tabular-nums ${
              isIncome ? 'text-emerald-600' : 'text-slate-950'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>

          <p className="text-xs text-slate-500 mt-1 capitalize font-medium">
            {transaction.type} entry
          </p>
        </div>

        {/* Detailed Fields List */}
        <div className="space-y-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Tag className="w-3.5 h-3.5 text-violet-600" />
              Category
            </span>
            <span className="font-bold text-slate-900">{transaction.category}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Date
            </span>
            <span className="font-bold text-slate-900">
              {transaction.formattedDate || transaction.date}
            </span>
          </div>

          {transaction.merchant && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-violet-600" />
                Merchant / Entity
              </span>
              <span className="font-bold text-slate-900">{transaction.merchant}</span>
            </div>
          )}

          {transaction.note && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-500 block mb-1 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Note
              </span>
              <p className="text-slate-700 italic">{transaction.note}</p>
            </div>
          )}
        </div>

        {/* Action Button: Delete Transaction */}
        <div className="mt-5 pt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onDelete(transaction.id);
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Transaction</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
