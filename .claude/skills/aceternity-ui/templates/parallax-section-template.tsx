// Template: Parallax Section
// Usage: Wrap content in ParallaxScroll for depth effect

'use client';

import { ParallaxScroll } from '@/components/ui/parallax-scroll';
import { RevealOnScroll } from '@/components/ui/reveal-on-scroll';

export function ParallaxSectionTemplate() {
  return (
    <section className="relative py-20 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4">
        {/* Background layer - slower parallax */}
        <ParallaxScroll speed={0.3} className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-gradient-to-b from-primary-500/20 to-transparent" />
        </ParallaxScroll>

        {/* Content layer - medium parallax */}
        <ParallaxScroll speed={0.5}>
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <RevealOnScroll>
              <h2 className="text-4xl font-bold text-white mb-6">
                Feature Headline
              </h2>
              <p className="text-neutral-300 text-lg mb-6">
                Describe your amazing feature with compelling copy that converts visitors.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-neutral-300">
                  <span className="mr-2">✓</span> Benefit one
                </li>
                <li className="flex items-center text-neutral-300">
                  <span className="mr-2">✓</span> Benefit two
                </li>
                <li className="flex items-center text-neutral-300">
                  <span className="mr-2">✓</span> Benefit three
                </li>
              </ul>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
              <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl">
                {/* Feature visual or demo */}
                <div className="aspect-video bg-neutral-800 rounded-lg flex items-center justify-center">
                  <span className="text-neutral-500">Feature Demo</span>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </ParallaxScroll>
      </div>
    </section>
  );
}
