// T016: 3D Card component with tilt effect
'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  rotationIntensity?: number;
  glareEnabled?: boolean;
}

export function Card3D({
  children,
  className,
  containerClassName,
  rotationIntensity = 15,
  glareEnabled = true,
}: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    [`${rotationIntensity}deg`, `-${rotationIntensity}deg`]
  );
  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    [`-${rotationIntensity}deg`, `${rotationIntensity}deg`]
  );

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    return (
      <div className={cn(containerClassName)}>
        <div className={cn('rounded-xl', className)}>{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn('perspective-[1000px]', containerClassName)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={cn(
          'relative rounded-xl transition-shadow duration-300',
          isHovered && 'shadow-2xl',
          className
        )}
      >
        {children}

        {/* Glare effect */}
        {glareEnabled && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.15) 0%, transparent 60%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

// Inner element that appears elevated from the card
export function Card3DContent({
  children,
  className,
  depth = 50,
}: {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}) {
  return (
    <div
      className={cn(className)}
      style={{ transform: `translateZ(${depth}px)` }}
    >
      {children}
    </div>
  );
}

// Animated card wrapper for entrance/exit animations
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  layoutId?: string;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  layoutId,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      layoutId={layoutId}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
        delay: prefersReducedMotion ? 0 : delay,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
