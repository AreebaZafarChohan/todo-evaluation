// T009: Gradient button component with hover animations
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
}

export function GradientButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  isLoading = false,
  disabled,
  type = 'button',
  onClick,
}: GradientButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-purple-500 via-indigo-500 to-teal-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30',
    secondary:
      'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30',
    outline:
      'border-2 border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:border-purple-400',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  return (
    <motion.button
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={onClick}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02, y: -2 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}

      {/* Gradient overlay for hover effect */}
      {variant !== 'outline' && (
        <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100" />
      )}
    </motion.button>
  );
}
