// T002: Utility helper for class name merging
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string with conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Animation variants for reduced motion support
 */
export const getAnimationVariants = (prefersReducedMotion: boolean) => ({
  hidden: prefersReducedMotion ? {} : { opacity: 0, y: 20 },
  visible: prefersReducedMotion ? {} : { opacity: 1, y: 0 },
  exit: prefersReducedMotion ? {} : { opacity: 0, y: -20 },
});

/**
 * Spring animation config
 */
export const springConfig = {
  stiffness: 300,
  damping: 30,
};
