// T033: Custom 404 page with animated elements
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { FiHome, FiSearch, FiFrown } from 'react-icons/fi';
import Link from 'next/link';
import { GradientButton } from '@/components/ui/gradient-button';

export default function NotFound() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--primary-500)]/10 mb-6"
        >
          <FiFrown className="w-12 h-12 text-[var(--primary-500)]" />
        </motion.div>

        <motion.h1 
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl font-bold text-[var(--foreground)] mb-2"
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-lg text-[var(--muted-foreground)] mb-8"
        >
          Sorry, we couldn't find the page you're looking for.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <GradientButton className="min-w-[160px]">
              <FiHome className="mr-2" />
              Back to Home
            </GradientButton>
          </Link>
          <Link href="/tasks">
            <GradientButton variant="outline" className="min-w-[160px]">
              <FiSearch className="mr-2" />
              Find Tasks
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}