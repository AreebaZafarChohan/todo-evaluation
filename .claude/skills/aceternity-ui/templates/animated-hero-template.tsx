// Template: Animated Hero Section
// Usage: Copy and customize for your landing page hero

'use client';

import { motion } from 'framer-motion';
import { Particles } from '@/components/ui/particles';
import { FloatingElement } from '@/components/ui/floating-element';

export function AnimatedHeroTemplate() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950">
      {/* Background particles */}
      <Particles count={80} color="#3b82f6" speed={0.3} />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Your Headline Here
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-neutral-300 mb-8"
        >
          Compelling subheadline that explains your value proposition
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold"
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 border border-neutral-600 text-white rounded-lg font-semibold hover:bg-neutral-800"
          >
            Learn More
          </motion.button>
        </motion.div>
      </div>

      {/* Floating decorative elements */}
      <FloatingElement duration={4} yOffset={30} className="absolute top-20 left-20">
        <div className="w-20 h-20 bg-primary-500/20 rounded-full blur-2xl" />
      </FloatingElement>

      <FloatingElement duration={5} delay={1} yOffset={40} className="absolute bottom-20 right-20">
        <div className="w-32 h-32 bg-secondary-500/20 rounded-full blur-2xl" />
      </FloatingElement>

      <FloatingElement duration={6} delay={2} yOffset={25} className="absolute top-1/2 right-10">
        <div className="w-16 h-16 bg-info-500/20 rounded-full blur-xl" />
      </FloatingElement>
    </section>
  );
}
