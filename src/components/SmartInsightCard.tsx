import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, TrendingDown, PieChart, AlertCircle, ChevronRight, Zap, Target } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface SmartInsightCardProps {
  transactions: Transaction[];
  monthlyBudget: number;
}

interface InsightItem {
  id: string;
  type: 'category' | 'single' | 'budget' | 'trend' | 'savings';
  badge: string;
  title: string;
  description: string;
  metric?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'violet' | 'emerald' | 'amber' | 'blue';
}

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({
  transactions,
  monthlyBudget,
}) => {
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  // Compute purely local, factual insights without any external API
  const insights = useMemo<InsightItem[]>(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const incomeTxs = transactions.filter((t) => t.type === 'income');

    const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);

    if (expenseTxs.length < 2) {
      return [];
    }

    const items: InsightItem[] = [];

    // 1. Top Category Insight
    const categoryTotals: Record<string, number> = {};
    expenseTxs.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0 && totalExpense > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const topPercentage = Math.round((topAmount / totalExpense) * 100);

      items.push({
        id: 'top-category',
        type: 'category',
        badge: 'Top Spending Category',
        title: `${topCategory} is your biggest spending category this month.`,
        description: `${topCategory} accounts for ${topPercentage}% of your total expenses (${formatCurrency(topAmount)} out of ${formatCurrency(totalExpense)}).`,
        metric: `${topPercentage}%`,
        icon: PieChart,
        tone: 'violet',
      });
    }

    // 2. Largest Single Expense Insight
    const sortedByAmount = [...expenseTxs].sort((a, b) => b.amount - a.amount);
    if (sortedByAmount.length > 0) {
      const maxTx = sortedByAmount[0];
      items.push({
        id: 'largest-expense',
        type: 'single',
        badge: 'Largest Purchase',
        title: `Your largest expense this month was ${maxTx.title || maxTx.category}.`,
        description: `Single payment of ${formatCurrency(maxTx.amount)} recorded in ${maxTx.category}.`,
        metric: formatCurrency(maxTx.amount),
        icon: Zap,
        tone: 'blue',
      });
    }

    // 3. Budget Pacing Insight
    if (monthlyBudget > 0) {
      const budgetUsedPct = Math.round((totalExpense / monthlyBudget) * 100);
      const remaining = monthlyBudget - totalExpense;

      if (remaining >= 0) {
        items.push({
          id: 'budget-pacing',
          type: 'budget',
          badge: 'Budget Pacing',
          title: `You have utilized ${budgetUsedPct}% of your monthly budget.`,
          description: `You have ${formatCurrency(remaining)} remaining in your budget for this month.`,
          metric: `${100 - budgetUsedPct}% left`,
          icon: Target,
          tone: 'emerald',
        });
      } else {
        items.push({
          id: 'budget-exceeded',
          type: 'budget',
          badge: 'Budget Alert',
          title: `You have exceeded your monthly budget goal.`,
          description: `Current spending exceeds budget by ${formatCurrency(Math.abs(remaining))}.`,
          metric: `+${budgetUsedPct - 100}% over`,
          icon: AlertCircle,
          tone: 'amber',
        });
      }
    }

    // 4. Net Cash Flow / Savings Rate Insight
    if (totalIncome > 0) {
      const savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
      if (savingsRate > 0) {
        items.push({
          id: 'savings-rate',
          type: 'savings',
          badge: 'Cash Flow',
          title: `You are saving ${savingsRate}% of your total income.`,
          description: `Total income of ${formatCurrency(totalIncome)} against ${formatCurrency(totalExpense)} in expenses.`,
          metric: `${savingsRate}% saved`,
          icon: TrendingUp,
          tone: 'emerald',
        });
      }
    }

    return items;
  }, [transactions, monthlyBudget]);

  // If there are less than 2 expense transactions, show the required fallback state
  if (insights.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 glass-card border border-slate-200/80 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
            <Sparkles className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 flex items-center gap-1.5">
              <span>Smart Spending Insights</span>
            </h4>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Add more transactions to unlock spending insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentInsight = insights[activeInsightIndex % insights.length];
  const Icon = currentInsight.icon;

  const toneGradients = {
    violet: {
      badge: 'bg-violet-100 text-violet-800 border-violet-200',
      iconBox: 'bg-violet-600/10 text-violet-700 border-violet-300/40',
      metricPill: 'bg-violet-50 text-violet-700 border-violet-200',
      accentGlow: 'from-violet-400/15 via-blue-400/10 to-pink-400/10',
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBox: 'bg-emerald-600/10 text-emerald-700 border-emerald-300/40',
      metricPill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentGlow: 'from-emerald-400/15 via-teal-400/10 to-blue-400/10',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      iconBox: 'bg-amber-600/10 text-amber-800 border-amber-300/40',
      metricPill: 'bg-amber-50 text-amber-800 border-amber-200',
      accentGlow: 'from-amber-400/15 via-orange-400/10 to-rose-400/10',
    },
    blue: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      iconBox: 'bg-blue-600/10 text-blue-700 border-blue-300/40',
      metricPill: 'bg-blue-50 text-blue-700 border-blue-200',
      accentGlow: 'from-blue-400/15 via-indigo-400/10 to-violet-400/10',
    },
  }[currentInsight.tone];

  return (
    <div className="relative group w-full mb-4">
      {/* Background Glass Prism Container */}
      <div className="relative overflow-hidden rounded-3xl p-5 glass-prism-card border border-slate-200/80 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Iridescent background glow sheen */}
        <div className={`absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br ${toneGradients.accentGlow} rounded-full blur-2xl pointer-events-none`} />

        {/* Top Header Row with Badge & Pagination */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${toneGradients.iconBox} shadow-xs`}>
              <Icon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${toneGradients.badge}`}>
                {currentInsight.badge}
              </span>
            </div>
          </div>

          {/* Carousel dots / switch button */}
          {insights.length > 1 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {insights.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveInsightIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeInsightIndex % insights.length
                        ? 'w-4 bg-violet-600'
                        : 'w-1.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                    aria-label={`Insight ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveInsightIndex((prev) => (prev + 1) % insights.length)}
                className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors ml-1 cursor-pointer"
                title="Next insight"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Insight Content */}
        <div className="relative z-10">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-snug">
            {currentInsight.title}
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
            {currentInsight.description}
          </p>
        </div>

        {/* Metric Pill if present */}
        {currentInsight.metric && (
          <div className="mt-3 pt-2.5 border-t border-slate-100/90 flex items-center justify-between text-xs relative z-10">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-500" />
              <span>CASH TRACKY Analysis</span>
            </span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${toneGradients.metricPill} tabular-nums`}>
              {currentInsight.metric}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
