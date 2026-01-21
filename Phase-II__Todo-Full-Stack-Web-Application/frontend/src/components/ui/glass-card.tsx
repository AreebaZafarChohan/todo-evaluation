// Enhanced Glassmorphism Card Component
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  border?: boolean;
  background?: string;
  blur?: string;
  shadow?: string;
  padding?: string;
  hoverEffect?: boolean;
  glow?: boolean;
  delay?: number;
}

export const GlassCard = ({
  children,
  className,
  border = true,
  background = 'rgba(255, 255, 255, 0.1)',
  blur = 'blur(16px)',
  shadow = '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
  padding = 'p-6',
  hoverEffect = true,
  glow = false,
  delay = 0
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverEffect ? { scale: 1.02 } : undefined}
      className={cn(
        'relative rounded-2xl border border-white/20 backdrop-blur-md overflow-hidden',
        padding,
        className
      )}
      style={{
        background: background,
        boxShadow: shadow,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
      }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

interface GlassCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const GlassCardHeader = ({ children, className }: GlassCardHeaderProps) => (
  <div className={cn('mb-4', className)}>{children}</div>
);

interface GlassCardTitleProps {
  children: ReactNode;
  className?: string;
}

export const GlassCardTitle = ({ children, className }: GlassCardTitleProps) => (
  <h3 className={cn('text-xl font-bold text-white', className)}>
    {children}
  </h3>
);

interface GlassCardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const GlassCardDescription = ({ children, className }: GlassCardDescriptionProps) => (
  <p className={cn('text-white/80', className)}>
    {children}
  </p>
);

interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export const GlassCardContent = ({ children, className }: GlassCardContentProps) => (
  <div className={cn('flex flex-col space-y-4', className)}>{children}</div>
);

interface GlassCardFooterProps {
  children: ReactNode;
  className?: string;
}

export const GlassCardFooter = ({ children, className }: GlassCardFooterProps) => (
  <div className={cn('mt-6', className)}>{children}</div>
);