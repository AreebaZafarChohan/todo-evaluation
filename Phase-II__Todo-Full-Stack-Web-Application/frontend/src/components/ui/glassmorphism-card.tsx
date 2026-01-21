// T025: Glassmorphism card component
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'light' | 'medium' | 'heavy';
  animate?: boolean;
}

export function GlassmorphismCard({
  children,
  className,
  blur = 'lg',
  intensity = 'medium',
  animate = true,
}: GlassmorphismCardProps) {
  const prefersReducedMotion = useReducedMotion();

  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const intensityClasses = {
    light: 'bg-white/10 dark:bg-black/10 border-white/10',
    medium: 'bg-white/20 dark:bg-black/20 border-white/20',
    heavy: 'bg-white/30 dark:bg-black/30 border-white/30',
  };

  const content = (
    <div
      className={cn(
        'rounded-2xl border p-6 sm:p-8',
        'shadow-xl shadow-black/5',
        blurClasses[blur],
        intensityClasses[intensity],
        'transition-all duration-300',
        className
      )}
      style={{
        WebkitBackdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '8px' : blur === 'lg' ? '16px' : '24px'})`,
      }}
    >
      {children}
    </div>
  );

  if (!animate || prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      {content}
    </motion.div>
  );
}

// Animated input with focus glow effect
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function GlassInput({
  label,
  error,
  icon,
  className,
  ...props
}: GlassInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            icon ? 'pl-10' : '', // Add left padding if icon is present
            'bg-white/10 border border-white/20',
            'text-white placeholder-white/50',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40',
            'focus:bg-white/15',
            error && 'border-red-400/50 focus:ring-red-400/30',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
