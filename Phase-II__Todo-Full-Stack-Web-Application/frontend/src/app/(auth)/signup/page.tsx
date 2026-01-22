// T028: Stunning Signup page with cosmic theme
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight, FiGithub, FiCheck, FiX } from 'react-icons/fi';
import { AiFillGoogleCircle } from 'react-icons/ai';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || '';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[a-z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-teal-500', 'bg-green-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name || email.split('@')[0],
          email,
          password,
          confirm_password: confirmPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Registration failed');
      } else {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/tasks');
      }
    } catch (err) {
      setError('An error occurred during registration');
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
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold text-white">
          Create your account
        </h2>
        <p className="mt-2 text-neutral-400 text-sm">
          Start organizing your tasks beautifully
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <motion.div
          variants={inputVariants}
          animate={focusedField === 'name' ? 'focused' : 'idle'}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Full Name
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiUser className={`w-5 h-5 transition-colors duration-200 ${
                focusedField === 'name' ? 'text-purple-400' : 'text-neutral-500'
              }`} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="John Doe"
            />
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: focusedField === 'name' ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

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
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="you@example.com"
            />
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
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="Create a strong password"
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

          {/* Password Strength Indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${passwordStrength >= 3 ? 'text-teal-400' : 'text-neutral-500'}`}>
                {strengthLabels[passwordStrength - 1] || 'Enter a password'}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Confirm Password Input */}
        <motion.div
          variants={inputVariants}
          animate={focusedField === 'confirmPassword' ? 'focused' : 'idle'}
          transition={{ duration: 0.2 }}
        >
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Confirm Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiLock className={`w-5 h-5 transition-colors duration-200 ${
                focusedField === 'confirmPassword' ? 'text-purple-400' : 'text-neutral-500'
              }`} />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
              required
              className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-white/10
                text-white placeholder-neutral-500 transition-all duration-300
                focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                focus:ring-2 focus:ring-purple-500/20"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-purple-400 transition-colors"
            >
              {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
            </button>
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-teal-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: focusedField === 'confirmPassword' ? '100%' : '0%' }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Password Match Indicator */}
          {confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center gap-2"
            >
              {password === confirmPassword ? (
                <>
                  <FiCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-xs text-teal-400">Passwords match</span>
                </>
              ) : (
                <>
                  <FiX className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">Passwords don't match</span>
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Terms Agreement */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center
              ${agreeToTerms
                ? 'bg-gradient-to-r from-purple-500 to-teal-500 border-transparent'
                : 'border-neutral-600 group-hover:border-purple-400'
              }`}
            >
              {agreeToTerms && (
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
            I agree to the{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
          </span>
        </label>

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
                Creating account...
              </>
            ) : (
              <>
                Create account
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-sm text-neutral-500 bg-[#0f0f14]">
            Or sign up with
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

      {/* Sign In Link */}
      <motion.p
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-neutral-400 text-sm"
      >
        Already have an account?{' '}
        <Link
          href="/signin"
          className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}
