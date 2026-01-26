// T012: Hero section composite component
'use client';

import { motion } from 'framer-motion';
import { Particles } from '@/components/ui/particles';
import { FloatingElement, GlowOrb } from '@/components/ui/floating-element';
import { AnimatedText } from '@/components/ui/animated-text';
import { GradientButton } from '@/components/ui/gradient-button';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        'bg-gradient-to-b from-[var(--neutral-900)] via-[var(--neutral-800)] to-[var(--neutral-900)]',
        className
      )}
    >
      {/* Background particles */}
      <Particles count={60} speed={0.3} showConnections={true} connectDistance={120} />

      {/* Decorative glow orbs */}
      <FloatingElement
        duration={6}
        yOffset={30}
        className="absolute top-20 left-[10%] hidden md:block"
      >
        <GlowOrb color="var(--primary-500)" size="lg" blur="3xl" />
      </FloatingElement>

      <FloatingElement
        duration={8}
        delay={2}
        yOffset={40}
        className="absolute bottom-32 right-[15%] hidden md:block"
      >
        <GlowOrb color="var(--secondary-500)" size="xl" blur="3xl" />
      </FloatingElement>

      <FloatingElement
        duration={5}
        delay={1}
        yOffset={25}
        className="absolute top-1/3 right-[5%] hidden lg:block"
      >
        <GlowOrb color="var(--info)" size="md" blur="2xl" />
      </FloatingElement>

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <AnimatedText delay={0} direction="up" className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 text-[var(--primary-400)] text-sm font-medium">
            <FiCheckCircle className="w-4 h-4" />
            Modern Task Management
          </span>
        </AnimatedText>

        {/* Headline */}
        <AnimatedText delay={0.1} direction="up" as="h1">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
            Organize Your Life
          </span>
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[var(--primary-400)] via-[var(--secondary-400)] to-[var(--primary-400)] bg-clip-text text-transparent">
            Beautifully
          </span>
        </AnimatedText>

        {/* Subheadline */}
        <AnimatedText delay={0.2} direction="up" className="mt-6 mb-10">
          <p className="text-lg sm:text-xl text-[var(--neutral-300)] max-w-2xl mx-auto leading-relaxed">
            Experience task management reimagined with stunning visuals, smooth animations,
            and an intuitive interface that makes productivity feel effortless.
          </p>
        </AnimatedText>

        {/* CTA Buttons */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/signup">
            <GradientButton size="lg" variant="primary" className="min-w-[180px] group">
              Get Started
              <FiArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </GradientButton>
          </Link>
          <Link href="/signin">
            <GradientButton size="lg" variant="outline" className="min-w-[180px]">
              Sign In
            </GradientButton>
          </Link>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
        >
          {[
            { title: 'Beautiful UI', desc: 'Stunning animations & effects' },
            { title: 'Dark Mode', desc: 'Easy on the eyes, always' },
            { title: 'Fast & Smooth', desc: '60fps animations everywhere' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-[var(--neutral-400)] text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
    </section>
  );
}
