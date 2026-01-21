// T013: Stunning landing page with cosmic theme
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Particles } from '@/components/ui/particles';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiArrowRight, FiCheck, FiZap, FiShield, FiSmartphone } from 'react-icons/fi';

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    {
      icon: FiZap,
      title: 'Lightning Fast',
      description: 'Instant task updates with real-time sync across all devices',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      icon: FiShield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and protected with enterprise-grade security',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: FiSmartphone,
      title: 'Works Everywhere',
      description: 'Access your tasks from any device with our responsive design',
      gradient: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, rgba(168, 85, 247, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 20%, rgba(20, 184, 166, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 10% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 90% 70%, rgba(217, 70, 239, 0.1) 0%, transparent 50%)
            `
          }}
        />

        {/* Particles */}
        {!prefersReducedMotion && (
          <Particles
            className="absolute inset-0"
            count={80}
            speed={0.2}
            connectDistance={100}
            color="rgba(168, 85, 247, 0.5)"
          />
        )}

        {/* Floating orbs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                top: '10%',
                left: '-10%',
              }}
              animate={{
                y: [0, 50, 0],
                x: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)',
                bottom: '10%',
                right: '-5%',
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          </>
        )}

        {/* Grid pattern */}
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

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </motion.div>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/signin"
                className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 rounded-xl font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
                }}
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 pt-20 pb-32">
          <div className="max-w-7xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                <FiCheck className="w-4 h-4" />
                Modern Task Management
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
              <span className="text-white">Organize Your Life</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400 bg-clip-text text-transparent">
                Beautifully
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-12"
            >
              Experience task management reimagined with stunning visuals,
              smooth animations, and an intuitive interface that makes
              productivity feel effortless.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/signup">
                <motion.button
                  className="px-8 py-4 rounded-xl font-semibold text-white flex items-center gap-2 group"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
                  }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  Get Started Free
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link href="/signin">
                <motion.button
                  className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition-colors"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose TaskFlow?
              </h2>
              <p className="text-neutral-400 max-w-xl mx-auto">
                Built with the latest technologies to give you the best task management experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Hover glow */}
                  <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-50 transition-opacity blur-sm`} />

                  {/* Card */}
                  <div className="relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm h-full">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} p-0.5 mb-6`}>
                      <div className="w-full h-full rounded-xl bg-[#0a0a0f] flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Background glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500/20 via-teal-500/20 to-pink-500/20 blur-2xl" />

              {/* Card */}
              <div className="relative p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                  Join thousands of users who are already managing their tasks more efficiently with TaskFlow.
                </p>
                <Link href="/signup">
                  <motion.button
                    className="px-8 py-4 rounded-xl font-semibold text-white inline-flex items-center gap-2 group"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
                    }}
                    whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                  >
                    Create Your Free Account
                    <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <span className="text-neutral-400">© 2026 TaskFlow. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
