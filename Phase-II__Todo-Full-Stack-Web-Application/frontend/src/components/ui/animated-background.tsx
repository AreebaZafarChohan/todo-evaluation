// Animated Background Component inspired by Aceternity UI
'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  children: ReactNode;
  className?: string;
  animationType?: 'gradient' | 'particles' | 'waves' | 'dots';
  speed?: 'slow' | 'normal' | 'fast';
  intensity?: 'low' | 'medium' | 'high';
}

export const AnimatedBackground = ({
  children,
  className,
  animationType = 'gradient',
  speed = 'normal',
  intensity = 'medium'
}: AnimatedBackgroundProps) => {
  const getAnimationClass = () => {
    switch (animationType) {
      case 'gradient':
        return `animate-gradient ${speed === 'slow' ? 'duration-3000' : speed === 'fast' ? 'duration-700' : 'duration-1500'} bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500`;
      case 'particles':
        return `animate-particles ${intensity === 'low' ? 'opacity-20' : intensity === 'high' ? 'opacity-60' : 'opacity-40'}`;
      case 'waves':
        return `animate-waves ${speed === 'slow' ? 'duration-3000' : speed === 'fast' ? 'duration-700' : 'duration-1500'}`;
      case 'dots':
        return `animate-dots ${speed === 'slow' ? 'duration-3000' : speed === 'fast' ? 'duration-700' : 'duration-1500'}`;
      default:
        return '';
    }
  };

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* Animated background layer */}
      <div 
        className={cn(
          'absolute inset-0 z-0',
          getAnimationClass(),
          animationType === 'gradient' && 'bg-size-200 bg-[length:200%_200%]',
          animationType === 'particles' && 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]',
          animationType === 'waves' && 'bg-[url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'2\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]',
          animationType === 'dots' && 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] bg-[length:20px_20px]'
        )}
        style={{
          background: animationType === 'gradient' 
            ? 'linear-gradient(90deg, #667eea 0%, #764ba2 25%, #667eea 50%, #764ba2 75%, #667eea 100%)'
            : undefined,
          animation: animationType === 'gradient' 
            ? 'gradient 15s ease infinite' 
            : undefined
        }}
      />
      
      {/* Custom animation styles */}
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes particles {
          0% { transform: translateY(0) translateX(0) rotate(0); }
          100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); }
        }
        
        @keyframes waves {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        
        .animate-particles {
          animation: particles 15s linear infinite;
        }
        
        .animate-waves {
          animation: waves 20s linear infinite;
        }
        
        .animate-dots {
          animation: dots 20s linear infinite;
        }
      `}</style>
      
      {/* Content layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};