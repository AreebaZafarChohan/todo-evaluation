// T026: Auth layout with animated background and glassmorphism
'use client';

import React from 'react';
import '../globals.css';
import { motion } from 'framer-motion';
import { Particles } from '@/components/ui/particles';
import { FloatingElement } from '@/components/ui/floating-element';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { AnimatedText } from '@/components/ui/animated-text';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      {!prefersReducedMotion && (
        <>
          <Particles
            className="absolute inset-0"
            quantity={80}
            ease={80}
            size={0.5}
            staticity={50}
            color="#ffffff"
          />
          <FloatingElement
            size={100}
            speed={20}
            className="top-1/4 left-1/4 bg-white/10 rounded-full blur-xl"
          />
          <FloatingElement
            size={150}
            speed={15}
            className="bottom-1/3 right-1/4 bg-indigo-500/20 rounded-full blur-2xl"
          />
        </>
      )}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <AnimatedText delay={0} direction="up" as="h1">
            <span className="text-3xl sm:text-4xl font-bold text-white">
              Welcome to Todo App
            </span>
          </AnimatedText>
          <AnimatedText delay={0.1} direction="up">
            <p className="mt-2 text-white/80">
              Sign in to your account or create a new one
            </p>
          </AnimatedText>
        </motion.div>

        <GlassmorphismCard className="w-full max-w-md">
          {children}
        </GlassmorphismCard>
      </div>
    </div>
  );
}