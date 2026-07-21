import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

import { useAuth, getStoredPersona } from '@/contexts/auth-context';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const persona = getStoredPersona();
  const personaLabel = persona === 'ADMIN' ? 'Tournament Operations Manager' : 'Fan / Volunteer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      void navigate('/', { replace: true });
    } catch (loginError: unknown) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-cyan-500/8 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/persona" className="focus-ring inline-flex items-center gap-3 rounded-xl">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-xl shadow-cyan-500/25">
              S
            </span>
            <span className="text-lg font-bold tracking-wide text-white">STADIUMSPHERE</span>
          </Link>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
            FIFA World Cup 2026
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
          {/* Persona badge */}
          {persona !== null && (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs font-semibold text-slate-300">
              <ShieldCheck size={14} className="text-cyan-400" />
              Signing in as {personaLabel}
            </div>
          )}

          <h1 className="text-center text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to your operations workspace
          </p>

          <form onSubmit={submit} className="mt-7 grid gap-5">
            {/* Email */}
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Email Address</span>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  required
                  autoComplete="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@stadiumsphere.ai"
                  className="focus-ring h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.06]"
                />
              </div>
            </label>

            {/* Password */}
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-300">Password</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  required
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="focus-ring h-11 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.06]"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-transparent text-cyan-500 focus:ring-cyan-400"
              />
              Remember this session
            </label>

            {/* Error */}
            {error !== null && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={submitting}
              className="focus-ring h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Authenticating…
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              state={{ role: persona }}
              className="font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Back to persona */}
        <div className="mt-6 text-center">
          <Link
            to="/persona"
            className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm text-slate-500 hover:text-slate-300"
          >
            <ArrowLeft size={14} />
            Change persona
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
