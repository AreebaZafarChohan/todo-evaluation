// T027: Stunning Signin page with cosmic theme
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiGithub } from 'react-icons/fi';
import { AiFillGoogleCircle } from 'react-icons/ai';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Invalid credentials');
      } else {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/tasks');
      }
    } catch (err) {
      setError('An error occurred during sign in');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Redirecting to ${provider} authentication`);
  };

  const inputVariants = {
    idle: { scale: 1 },
    focused: { scale: 1.02 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-neutral-400 text-sm">
          Sign in to continue to your dashboard
        </p>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-xl p-4 border border-red-500/30 bg-red-500/10"
          >
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <motion.div
          variants={inputVariants}
          animate={focusedField === 'email' ? 'focused' : 'idle'}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Email address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiMail className={`w-5 h-5 transition-colors duration-200 ${
                focusedField === 'email' ? 'text-purple-400' : 'text-neutral-500'
              }`} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="you@example.com"
            />
            {/* Gradient line on focus */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: focusedField === 'email' ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Password Input */}
        <motion.div
          variants={inputVariants}
          animate={focusedField === 'password' ? 'focused' : 'idle'}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiLock className={`w-5 h-5 transition-colors duration-200 ${
                focusedField === 'password' ? 'text-purple-400' : 'text-neutral-500'
              }`} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-purple-400 transition-colors"
            >
              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: focusedField === 'password' ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
                ${rememberMe
                  ? 'bg-gradient-to-r from-purple-500 to-teal-500 border-transparent'
                  : 'border-neutral-600 group-hover:border-purple-400'
                }`}
              >
                {rememberMe && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
            </div>
            <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
              Remember me
            </span>
          </label>

          <a
            href="#"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 rounded-xl font-semibold text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #14b8a6 100%)',
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm text-neutral-500 bg-[#0f0f14]">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          onClick={() => handleSocialLogin('GitHub')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl
            bg-white/5 border border-white/10 text-neutral-300
            hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <FiGithub className="w-5 h-5" />
          <span className="text-sm font-medium">GitHub</span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => handleSocialLogin('Google')}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl
            bg-white/5 border border-white/10 text-neutral-300
            hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        >
          <AiFillGoogleCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Google</span>
        </motion.button>
      </div>

      {/* Sign Up Link */}
      <motion.p
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-neutral-400 text-sm"
      >
        Don't have an account?{' '}
        <Link
          href="/signup"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </motion.p>
    </div>
  );
}
