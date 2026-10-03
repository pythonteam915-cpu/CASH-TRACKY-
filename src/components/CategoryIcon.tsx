import React from 'react';
import {
  Home,
  ShoppingCart,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  HeartPulse,
  CreditCard,
  Zap,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  Sparkles,
  Gift,
  PlusCircle,
  Tag,
  Bookmark,
} from 'lucide-react';
import { TransactionCategory, TransactionType } from '../types/finance';

interface CategoryIconProps {
  category: TransactionCategory;
  type: TransactionType;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  type,
  className = 'w-4 h-4',
  size = 18,
}) => {
  const iconProps = { className, size };

  switch (category) {
    case 'Housing':
      return <Home {...iconProps} />;
    case 'Groceries':
      return <ShoppingCart {...iconProps} />;
    case 'Dining & Drinks':
      return <Utensils {...iconProps} />;
    case 'Transport':
      return <Car {...iconProps} />;
    case 'Entertainment':
      return <Film {...iconProps} />;
    case 'Shopping':
      return <ShoppingBag {...iconProps} />;
    case 'Health & Fitness':
      return <HeartPulse {...iconProps} />;
    case 'Subscriptions':
      return <CreditCard {...iconProps} />;
    case 'Utilities':
      return <Zap {...iconProps} />;
    case 'Travel':
      return <Car {...iconProps} />;
    case 'Salary':
      return <Briefcase {...iconProps} />;
    case 'Freelance':
      return <Laptop {...iconProps} />;
    case 'Investments':
      return <TrendingUp {...iconProps} />;
    case 'Bonus':
      return <Sparkles {...iconProps} />;
    case 'Gifts & Cash':
      return <Gift {...iconProps} />;
    case 'Other Income':
      return <PlusCircle {...iconProps} />;
    case 'Other Expense':
      return <MoreHorizontal {...iconProps} />;
    default:
      // Custom user-defined category icon
      return type === 'income' ? <PlusCircle {...iconProps} /> : <Tag {...iconProps} />;
  }
};

export const getCategoryStyles = (category: TransactionCategory, type: TransactionType) => {
  if (type === 'income') {
    switch (category) {
      case 'Salary':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-700',
        };
      case 'Freelance':
        return {
          bg: 'bg-violet-100',
          border: 'border-violet-200',
          text: 'text-violet-700',
        };
      case 'Investments':
        return {
          bg: 'bg-emerald-100',
          border: 'border-emerald-200',
          text: 'text-emerald-700',
        };
      case 'Bonus':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-200',
          text: 'text-amber-700',
        };
      case 'Gifts & Cash':
        return {
          bg: 'bg-pink-100',
          border: 'border-pink-200',
          text: 'text-pink-700',
        };
      default:
        return {
          bg: 'bg-teal-100',
          border: 'border-teal-200',
          text: 'text-teal-700',
        };
    }
  }

  // Expense styles
  switch (category) {
    case 'Housing':
      return {
        bg: 'bg-indigo-100',
        border: 'border-indigo-200',
        text: 'text-indigo-700',
      };
    case 'Groceries':
      return {
        bg: 'bg-emerald-100',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
      };
    case 'Dining & Drinks':
      return {
        bg: 'bg-amber-100',
        border: 'border-amber-200',
        text: 'text-amber-700',
      };
    case 'Transport':
      return {
        bg: 'bg-sky-100',
        border: 'border-sky-200',
        text: 'text-sky-700',
      };
    case 'Entertainment':
      return {
        bg: 'bg-pink-100',
        border: 'border-pink-200',
        text: 'text-pink-700',
      };
    case 'Shopping':
      return {
        bg: 'bg-fuchsia-100',
        border: 'border-fuchsia-200',
        text: 'text-fuchsia-700',
      };
    case 'Health & Fitness':
      return {
        bg: 'bg-rose-100',
        border: 'border-rose-200',
        text: 'text-rose-700',
      };
    case 'Subscriptions':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-200',
        text: 'text-purple-700',
      };
    case 'Utilities':
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
      };
    default:
      return {
        bg: 'bg-violet-100',
        border: 'border-violet-200',
        text: 'text-violet-700',
      };
  }
};
