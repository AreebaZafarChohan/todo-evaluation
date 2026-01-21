// T026: Auth layout with stunning cosmic animated background
'use client';

import React from 'react';
import '../globals.css';
import { motion } from 'framer-motion';
import { Particles } from '@/components/ui/particles';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated cosmic background */}
      <div className="fixed inset-0 bg-[#0a0a0f]">
        {/* Gradient mesh overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(20, 184, 166, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 10% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 90% 70%, rgba(217, 70, 239, 0.2) 0%, transparent 50%)
            `
          }}
        />

        {/* Animated particles */}
        {!prefersReducedMotion && (
          <Particles
            className="absolute inset-0"
            count={100}
            speed={0.3}
            connectDistance={80}
            color="rgba(168, 85, 247, 0.6)"
          />
        )}

        {/* Floating orbs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                top: '10%',
                left: '5%',
              }}
              animate={{
                y: [0, 30, 0],
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-80 h-80 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
                bottom: '20%',
                right: '10%',
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, -30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
            <motion.div
              className="absolute w-64 h-64 rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(217, 70, 239, 0.1) 0%, transparent 70%)',
                top: '60%',
                left: '15%',
              }}
              animate={{
                y: [0, 20, 0],
                scale: [1, 0.9, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
            />
          </>
        )}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo/Brand */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Animated Logo */}
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-4xl">✨</span>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-teal-500/20 blur-xl -z-10" />
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-2 text-neutral-400 text-sm sm:text-base"
            >
              Organize your life beautifully
            </motion.p>
          </motion.div>

          {/* Auth Card Container */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 100 }}
            className="w-full max-w-md"
          >
            {/* Glass card with gradient border */}
            <div className="relative">
              {/* Animated gradient border */}
              <div
                className="absolute -inset-[1px] rounded-3xl opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(20, 184, 166, 0.5), rgba(217, 70, 239, 0.5))',
                  filter: 'blur(1px)',
                }}
              />

              {/* Card content */}
              <div
                className="relative rounded-3xl p-8 sm:p-10"
                style={{
                  background: 'rgba(15, 15, 20, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {children}
              </div>
            </div>
          </motion.div>

          {/* Footer text */}
          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center text-sm text-neutral-500"
          >
            By continuing, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy Policy
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
