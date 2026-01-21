// T032: Settings page with theme switcher and profile options
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { cn } from '@/lib/utils';
import { 
  FiSun, 
  FiMoon, 
  FiMonitor, 
  FiUser, 
  FiBell, 
  FiShield, 
  FiInfo, 
  FiCheck 
} from 'react-icons/fi';
import { GradientButton } from '@/components/ui/gradient-button';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const themeOptions = [
    { id: 'light', label: 'Light', icon: <FiSun className="w-5 h-5" /> },
    { id: 'dark', label: 'Dark', icon: <FiMoon className="w-5 h-5" /> },
    { id: 'system', label: 'System', icon: <FiMonitor className="w-5 h-5" /> },
  ];

  const settingsSections = [
    {
      title: 'Profile',
      icon: <FiUser className="w-5 h-5" />,
      options: [
        { label: 'Account Information', value: 'account' },
        { label: 'Privacy Settings', value: 'privacy' },
        { label: 'Notifications', value: 'notifications' },
      ]
    },
    {
      title: 'Preferences',
      icon: <FiBell className="w-5 h-5" />,
      options: [
        { label: 'Appearance', value: 'appearance' },
        { label: 'Accessibility', value: 'accessibility' },
        { label: 'Language', value: 'language' },
      ]
    },
    {
      title: 'Security',
      icon: <FiShield className="w-5 h-5" />,
      options: [
        { label: 'Password', value: 'password' },
        { label: 'Two-factor Authentication', value: '2fa' },
        { label: 'Login History', value: 'history' },
      ]
    }
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted-foreground)] mt-2">
          Customize your TodoApp experience
        </p>
      </motion.div>

      {/* Theme selection */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]"
      >
        <div className="flex items-center mb-6">
          <FiMonitor className="w-6 h-6 text-[var(--primary-500)] mr-3" />
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Appearance</h2>
        </div>
        
        <div className="mb-4">
          <h3 className="text-[var(--foreground)] font-medium mb-3">Theme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleThemeChange(option.id)}
                className={cn(
                  'flex flex-col items-center justify-center p-4 rounded-lg border transition-all',
                  theme === option.id
                    ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                    : 'border-[var(--card-border)] hover:border-[var(--primary-500)]/50'
                )}
              >
                <span className={cn(
                  'mb-2',
                  theme === option.id ? 'text-[var(--primary-500)]' : 'text-[var(--muted-foreground)]'
                )}>
                  {option.icon}
                </span>
                <span className="text-sm text-[var(--foreground)]">{option.label}</span>
                {theme === option.id && (
                  <span className="absolute top-2 right-2">
                    <FiCheck className="w-4 h-4 text-[var(--primary-500)]" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-[var(--foreground)] font-medium mb-3">Accessibility</h3>
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--card-border)]">
            <div>
              <p className="text-[var(--foreground)] font-medium">Reduce Motion</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Minimize animations and transitions
              </p>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                reducedMotion ? 'bg-[var(--primary-500)]' : 'bg-[var(--muted)]'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  reducedMotion ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Settings sections */}
      {settingsSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + sectionIndex * 0.1 }}
          className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]"
        >
          <div className="flex items-center mb-6">
            <span className="text-[var(--primary-500)] mr-3">
              {section.icon}
            </span>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{section.title}</h2>
          </div>
          
          <div className="space-y-3">
            {section.options.map((option, optionIndex) => (
              <div 
                key={option.value}
                className="flex items-center justify-between p-4 rounded-lg border border-[var(--card-border)] hover:bg-[var(--muted)]/30 transition-colors"
              >
                <span className="text-[var(--foreground)]">{option.label}</span>
                <GradientButton size="sm" variant="outline">
                  Manage
                </GradientButton>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* About section */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)]"
      >
        <div className="flex items-center mb-6">
          <FiInfo className="w-6 h-6 text-[var(--primary-500)] mr-3" />
          <h2 className="text-xl font-semibold text-[var(--foreground)]">About</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-[var(--foreground)] font-medium">Version</h3>
            <p className="text-[var(--muted-foreground)]">1.0.0</p>
          </div>
          <div>
            <h3 className="text-[var(--foreground)] font-medium">License</h3>
            <p className="text-[var(--muted-foreground)]">MIT License</p>
          </div>
          <div>
            <h3 className="text-[var(--foreground)] font-medium">Support</h3>
            <p className="text-[var(--muted-foreground)]">Contact us at support@todoapp.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}