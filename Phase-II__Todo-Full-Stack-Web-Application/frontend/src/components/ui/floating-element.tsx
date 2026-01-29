// T011: Floating element animation wrapper
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  yOffset?: number;
  xOffset?: number;
  rotateRange?: number;
}

export function FloatingElement({
  children,
  className,
  duration = 4,
  delay = 0,
  yOffset = 20,
  xOffset = 0,
  rotateRange = 0,
}: FloatingElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      animate={{
        y: [0, -yOffset, 0],
        x: xOffset ? [0, xOffset, 0] : 0,
        rotate: rotateRange ? [-rotateRange, rotateRange, -rotateRange] : 0,
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for decorative elements
interface PulseElementProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

export function PulseElement({
  children,
  className,
  duration = 2,
  scale = 1.1,
}: PulseElementProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      animate={{
        scale: [1, scale, 1],
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}

// Glow orb decorative element
interface GlowOrbProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function GlowOrb({
  className,
  color = 'var(--primary-500)',
  size = 'md',
  blur = '2xl',
}: GlowOrbProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const blurs = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
    '2xl': 'blur-2xl',
    '3xl': 'blur-3xl',
  };

  return (
    <div
      className={cn(
        'rounded-full opacity-30',
        sizes[size],
        blurs[blur],
        className
      )}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}
