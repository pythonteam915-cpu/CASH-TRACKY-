import React from 'react';
import { motion } from 'motion/react';
import { Home, Receipt, Plus, PieChart, User } from 'lucide-react';
import { playTabSwitchSound, playAddButtonSound } from '../utils/soundEffects';

export type NavTab = 'home' | 'expenses' | 'add' | 'analytics' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const standardTabs: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  // 'add' is center
  { id: 'analytics', label: 'Analytics', icon: PieChart },
  { id: 'profile', label: 'Profile', icon: User },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  // Smooth ease-out transition config (250–320ms)
  const easeOutTransition = {
    duration: 0.28,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  // Subtle haptic feedback helper for Android devices
  const triggerHaptic = (pattern: number | number[] = 10) => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently catch if device restricts vibration or permissions
      }
    }
  };

  const handleTabClick = (tabId: NavTab) => {
    triggerHaptic(10); // Crisp 10ms micro-vibration tick
    playTabSwitchSound();
    onTabChange(tabId);
  };

  const handleAddClick = () => {
    triggerHaptic(16); // Slightly more tactile 16ms pulse for the center '+' action
    playAddButtonSound();
    onTabChange('add');
  };

  const renderStandardTab = (tab: NavItemConfig) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;

    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => handleTabClick(tab.id)}
        className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl cursor-pointer min-h-[52px] select-none transition-colors"
      >
        {/* Active Icon Container with smooth scale & glass-prism glow */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Glass-Prism Glow for Active Tab */}
          {isActive && (
            <motion.div
              layoutId="activeTabGlow"
              className="absolute -inset-2 rounded-full bg-gradient-to-r from-violet-500/25 via-blue-500/20 to-pink-500/15 blur-sm pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={easeOutTransition}
            />
          )}

          {/* Icon with gentle scale-up and scale-down */}
          <motion.div
            animate={{
              scale: isActive ? 1.15 : 1,
              y: isActive ? -1 : 0,
            }}
            transition={easeOutTransition}
            className={`relative z-10 flex items-center justify-center ${
              isActive ? 'text-violet-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-colors duration-200 ${
                isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </motion.div>

          {/* Small Sliding / Flowing Indicator under active tab */}
          {isActive && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute -bottom-2 w-4 h-1 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-500 shadow-[0_1px_6px_rgba(124,58,237,0.4)] z-20"
              transition={easeOutTransition}
            />
          )}
        </div>

        {/* Tab Label with smooth opacity & color fade-in */}
        <motion.span
          animate={{
            opacity: isActive ? 1 : 0.65,
            scale: isActive ? 1.02 : 1,
          }}
          transition={easeOutTransition}
          className={`text-[10px] tracking-tight mt-1.5 z-10 font-semibold ${
            isActive ? 'text-violet-600 font-bold' : 'text-slate-500'
          }`}
        >
          {tab.label}
        </motion.span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto w-full px-3 pb-2 pt-1 pointer-events-auto"
    >
      {/* Glass Navigation Bar Container */}
      <div className="relative rounded-3xl glass-bottom-nav bg-white/92 backdrop-blur-2xl border border-slate-200/80 shadow-[0_-8px_30px_-5px_rgba(99,102,241,0.12)] px-2 py-1 flex items-center justify-between">
        {/* 1. Home Tab */}
        {renderStandardTab(standardTabs[0])}

        {/* 2. Expenses Tab */}
        {renderStandardTab(standardTabs[1])}

        {/* 3. Add: Prominent Center "+" Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5 relative z-30">
          {/* Subtle glow halo under + button when active */}
          {activeTab === 'add' && (
            <motion.div
              layoutId="activeCenterGlow"
              className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-600/30 via-pink-500/20 to-blue-500/30 blur-md pointer-events-none"
              transition={easeOutTransition}
            />
          )}

          <motion.button
            type="button"
            onClick={handleAddClick}
            whileTap={{ scale: 0.88 }}
            animate={{
              scale: activeTab === 'add' ? 1.08 : 1,
              boxShadow:
                activeTab === 'add'
                  ? '0 12px 28px -4px rgba(124, 58, 237, 0.45)'
                  : '0 8px 20px -4px rgba(124, 58, 237, 0.3)',
            }}
            transition={{
              type: 'spring',
              stiffness: 450,
              damping: 25,
            }}
            className="group relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-500 text-white cursor-pointer select-none overflow-hidden"
            aria-label="Add Transaction"
          >
            {/* Subtle glass-prism iridescent shimmer sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-pink-400/20 to-white/35 pointer-events-none" />

            <motion.div
              animate={{ rotate: activeTab === 'add' ? 45 : 0 }}
              transition={easeOutTransition}
            >
              <Plus className="w-6.5 h-6.5 text-white stroke-[2.8]" />
            </motion.div>
          </motion.button>

          {/* Add Label */}
          <motion.span
            animate={{
              opacity: activeTab === 'add' ? 1 : 0.7,
              scale: activeTab === 'add' ? 1.04 : 1,
            }}
            transition={easeOutTransition}
            className={`text-[10px] tracking-tight mt-1 font-bold ${
              activeTab === 'add' ? 'text-violet-600 font-extrabold' : 'text-slate-500'
            }`}
          >
            Add
          </motion.span>
        </div>

        {/* 4. Analytics Tab */}
        {renderStandardTab(standardTabs[2])}

        {/* 5. Profile Tab */}
        {renderStandardTab(standardTabs[3])}
      </div>
    </nav>
  );
};
