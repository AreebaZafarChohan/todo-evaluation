// Modern Card Component with Aceternity-inspired design
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  border?: boolean;
  glow?: boolean;
  glowColor?: string;
  delay?: number;
}

export const ModernCard = ({
  children,
  className,
  hoverEffect = true,
  border = true,
  glow = false,
  glowColor = 'rgba(99, 102, 241, 0.2)',
  delay = 0
}: ModernCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { y: -5 } : undefined}
      className={cn(
        'relative rounded-2xl p-6 bg-white dark:bg-gray-800 overflow-hidden',
        border && 'border border-gray-200 dark:border-gray-700',
        hoverEffect && 'transition-all duration-300 cursor-pointer',
        className
      )}
      style={{
        boxShadow: glow 
          ? `0 0 20px ${glowColor}` 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

interface ModernCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const ModernCardHeader = ({ children, className }: ModernCardHeaderProps) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

interface ModernCardTitleProps {
  children: ReactNode;
  className?: string;
}

export const ModernCardTitle = ({ children, className }: ModernCardTitleProps) => (
  <h3 className={cn('text-xl font-bold text-gray-900 dark:text-white', className)}>
    {children}
  </h3>
);

interface ModernCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const ModernCardDescription = ({ children, className }: ModernCardDescriptionProps) => (
  <p className={cn('text-gray-600 dark:text-gray-400', className)}>
    {children}
  </p>
);

interface ModernCardContentProps {
  children: ReactNode;
  className?: string;
}

export const ModernCardContent = ({ children, className }: ModernCardContentProps) => (
  <div className={cn('flex flex-col space-y-4', className)}>{children}</div>
);

interface ModernCardFooterProps {
  children: ReactNode;
  className?: string;
}

export const ModernCardFooter = ({ children, className }: ModernCardFooterProps) => (
  <div className={cn('mt-6', className)}>{children}</div>
);