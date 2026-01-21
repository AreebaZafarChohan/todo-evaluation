// Test page to showcase new UI components
'use client';

import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent, GlassCardFooter } from '@/components/ui/glass-card';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernCardFooter } from '@/components/ui/modern-card';
import { FiCheck, FiStar, FiHeart, FiCoffee } from 'react-icons/fi';

export default function UITestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Modern UI Components Showcase
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Glass Card Example */}
          <GlassCard className="h-full" glow={true}>
            <GlassCardHeader>
              <GlassCardTitle>Glass Morphism Card</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              <p className="text-white/80 mb-4">
                This card features a beautiful glass morphism effect with subtle transparency and blur.
              </p>
              <div className="flex items-center gap-2 text-blue-300">
                <FiStar className="w-5 h-5" />
                <span>Modern Design</span>
              </div>
            </GlassCardContent>
            <GlassCardFooter>
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors">
                Learn More
              </button>
            </GlassCardFooter>
          </GlassCard>
          
          {/* Modern Card Example */}
          <ModernCard className="h-full" hoverEffect={true} glow={true}>
            <ModernCardHeader>
              <ModernCardTitle>Modern Card</ModernCardTitle>
            </ModernCardHeader>
            <ModernCardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This card features a clean, modern design with subtle hover effects and smooth animations.
              </p>
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <FiHeart className="w-5 h-5" />
                <span>Enhanced UX</span>
              </div>
            </ModernCardContent>
            <ModernCardFooter>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </ModernCardFooter>
          </ModernCard>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <ModernCard key={item} delay={item * 0.1}>
              <ModernCardContent>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FiCoffee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Feature {item}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  This is an example of a modern card component with enhanced styling and animations.
                </p>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>
      </div>
    </div>
  );
}