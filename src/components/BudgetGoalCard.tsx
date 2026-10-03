import React, { useState } from 'react';
import { Target, Edit3, AlertCircle, CheckCircle2, X, Check } from 'lucide-react';
import { formatCurrency, getAppCurrency } from '../utils/formatters';

interface BudgetGoalCardProps {
  monthlyBudget: number;
  totalExpenses: number;
  onUpdateBudget: (newBudget: number) => void;
  isCloudSynced?: boolean;
}

export const BudgetGoalCard: React.FC<BudgetGoalCardProps> = ({
  monthlyBudget,
  totalExpenses,
  onUpdateBudget,
  isCloudSynced = false,
}) => {
  const { symbol } = getAppCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [inputBudget, setInputBudget] = useState(monthlyBudget.toString());
  const [editError, setEditError] = useState('');

  // Calculations
  const validBudget = monthlyBudget > 0 ? monthlyBudget : 1;
  const percentageSpent = Math.min(100, Math.round((totalExpenses / validBudget) * 100));
  const rawPercentage = ((totalExpenses / validBudget) * 100).toFixed(1);
  const remainingBudget = monthlyBudget - totalExpenses;
  const isOverBudget = remainingBudget < 0;
  const isNearLimit = !isOverBudget && percentageSpent >= 80;

  const handleOpenEdit = () => {
    setInputBudget(monthlyBudget.toString());
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(inputBudget);
    if (isNaN(val) || val <= 0) {
      setEditError('Please enter a budget greater than $0.');
      return;
    }
    if (val > 1000000) {
      setEditError('Maximum allowed budget is $1,000,000.');
      return;
    }
    onUpdateBudget(val);
    setIsEditing(false);
  };

  // Color state for progress bar
  let progressGradient = 'from-violet-600 via-indigo-600 to-blue-500';
  let badgeStyle = 'bg-violet-100 text-violet-700 border-violet-200';
  let statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;

  if (isOverBudget) {
    progressGradient = 'from-rose-500 via-pink-600 to-red-500';
    badgeStyle = 'bg-rose-100 text-rose-700 border-rose-200';
    statusIcon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
  } else if (isNearLimit) {
    progressGradient = 'from-amber-500 via-orange-500 to-rose-400';
    badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';
    statusIcon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
  }

  const presets = [1500, 2500, 3500, 5000, 7500];

  return (
    <div className="relative group w-full mb-4">
      {/* Background glass card */}
      <div className="relative overflow-hidden rounded-3xl p-5 glass-card border border-slate-200/80 shadow-sm transition-all duration-200 hover:border-violet-300">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Monthly Budget Goal
                </h3>
                {isCloudSynced && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Synced to cloud" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Spending target for this month
              </p>
            </div>
          </div>

          {/* Edit Budget Trigger */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-violet-100 border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-violet-800 transition-all cursor-pointer active:scale-95"
            title="Edit monthly budget goal"
          >
            <Edit3 className="w-3 h-3 text-violet-600" />
            <span>Set Goal</span>
          </button>
        </div>

        {/* Amounts & Percentage Breakdown */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-950 tabular-nums tracking-tight">
              {formatCurrency(totalExpenses)}
            </span>
            <span className="text-xs text-slate-500 font-semibold tabular-nums">
              / {formatCurrency(monthlyBudget)}
            </span>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold tabular-nums ${badgeStyle}`}>
            {statusIcon}
            <span>{rawPercentage}%</span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-500 relative`}
            style={{ width: `${Math.min(100, Math.max(2, (totalExpenses / validBudget) * 100))}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/50" />
          </div>
        </div>

        {/* Dynamic Footnote / Advice */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span>Remaining:</span>
            <strong
              className={`tabular-nums font-bold ${
                isOverBudget ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {isOverBudget ? `-${formatCurrency(Math.abs(remainingBudget))}` : formatCurrency(remainingBudget)}
            </strong>
          </span>

          <span className="text-[11px] text-slate-500 font-medium">
            {isOverBudget
              ? 'Exceeded goal'
              : `${Math.round(100 - (totalExpenses / validBudget) * 100)}% free`}
          </span>
        </div>
      </div>

      {/* Set Budget Goal Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setIsEditing(false)} />

          <div className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 z-10 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                <h3 className="text-base font-bold text-slate-900">Set Monthly Budget</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-center">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Budget Target
                </label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-violet-600">{symbol}</span>
                  <input
                    type="number"
                    step="50"
                    min="1"
                    max="1000000"
                    value={inputBudget}
                    onChange={(e) => {
                      setInputBudget(e.target.value);
                      if (editError) setEditError('');
                    }}
                    className="w-40 text-center text-3xl font-black bg-transparent text-slate-900 focus:outline-none tabular-nums"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInputBudget(preset.toString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        inputBudget === preset.toString()
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {symbol}{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {editError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  {editError}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-violet-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
