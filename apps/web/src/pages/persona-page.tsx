import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  Accessibility,
  BarChart3,
  BellRing,
  Bot,
  Bus,
  CalendarDays,
  Globe2,
  Leaf,
  Map,
  Megaphone,
  Navigation,
  Shield,
  ShieldCheck,
  Sparkles,
  Building2,
  Ticket,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

import { setStoredPersona } from '@/contexts/auth-context';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const card = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } } };

interface PersonaDefinition {
  capabilities: readonly { icon: typeof Building2; label: string }[];
  cta: string;
  description: string;
  emoji: string;
  gradient: string;
  headline: string;
  role: 'ADMIN' | 'USER';
  title: string;
}

const personas: readonly PersonaDefinition[] = [
  {
    capabilities: [
      { icon: Building2, label: 'Stadium Operations' },
      { icon: CalendarDays, label: 'Event Management' },
      { icon: Map, label: 'Venue Administration' },
      { icon: Users, label: 'Volunteer Coordination' },
      { icon: Sparkles, label: 'Crowd Intelligence' },
      { icon: BarChart3, label: 'Operational Analytics' },
      { icon: Bot, label: 'AI Decision Support' },
      { icon: Leaf, label: 'Sustainability Monitoring' },
      { icon: Shield, label: 'Emergency Coordination' },
      { icon: Megaphone, label: 'Executive Reporting' },
    ],
    cta: 'Continue as Tournament Operations Manager',
    description: 'Monitor stadium operations, manage events, coordinate volunteers, oversee crowd movement, optimize transportation, improve sustainability, and make real-time operational decisions using AI.',
    emoji: '🏟',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    headline: 'Manage FIFA World Cup stadium operations with AI-powered operational intelligence.',
    role: 'ADMIN',
    title: 'Tournament Operations Manager',
  },
  {
    capabilities: [
      { icon: Navigation, label: 'Stadium Navigation' },
      { icon: Trophy, label: 'Match Information' },
      { icon: CalendarDays, label: 'Event Discovery' },
      { icon: Bus, label: 'Transportation Guidance' },
      { icon: Accessibility, label: 'Accessibility Assistance' },
      { icon: Zap, label: 'Live Tournament Updates' },
      { icon: Bot, label: 'Personalized AI Recommendations' },
      { icon: Globe2, label: 'Multilingual Support' },
      { icon: BellRing, label: 'Emergency Information' },
      { icon: Ticket, label: 'Digital Fan Companion' },
    ],
    cta: 'Continue as Fan / Volunteer',
    description: 'Navigate venues, discover events, receive personalized recommendations, access multilingual assistance, transportation guidance, accessibility support, and live tournament updates powered by AI.',
    emoji: '🎟',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    headline: 'Experience FIFA World Cup 2026 with AI-powered guidance and multilingual assistance.',
    role: 'USER',
    title: 'Fan / Volunteer',
  },
];

export function PersonaPage() {
  const navigate = useNavigate();


  const selectPersona = (role: 'ADMIN' | 'USER') => {
    setStoredPersona(role);
    void navigate('/login', { state: { role } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-[100px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-xl font-bold shadow-xl shadow-cyan-500/25">
              S
            </span>
          </div>
          <h1 className="mt-6 bg-gradient-to-r from-white via-white to-cyan-200 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl">
            StadiumSphere AI
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
            FIFA World Cup 2026 · AI Operations Platform
          </p>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
            Choose how you want to experience the world's most advanced AI-powered stadium operations platform.
          </p>
        </motion.header>

        {/* Persona Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {personas.map((persona) => (
            <motion.div key={persona.role} variants={card}>
              <button
                type="button"
                onClick={() => selectPersona(persona.role)}

                className="focus-ring group relative w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] p-7 text-left backdrop-blur-xl transition-all duration-500 hover:border-white/[0.15] hover:bg-white/[0.06] sm:p-9"
              >
                {/* Glow effect */}
                <div className={`pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br ${persona.gradient} opacity-0 blur-[80px] transition-opacity duration-700 group-hover:opacity-20`} />

                {/* Emoji + title */}
                <div className="relative flex items-start gap-4">
                  <span className="text-5xl">{persona.emoji}</span>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold tracking-tight">{persona.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-cyan-300">{persona.headline}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="relative mt-5 text-sm leading-7 text-slate-400">{persona.description}</p>

                {/* Capabilities grid */}
                <div className="relative mt-6 grid grid-cols-2 gap-2.5">
                  {persona.capabilities.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <div
                        key={cap.label}
                        className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-xs font-medium text-slate-300 transition group-hover:border-white/[0.1] group-hover:bg-white/[0.04]"
                      >
                        <Icon size={14} className="shrink-0 text-cyan-400" />
                        <span className="truncate">{cap.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="relative mt-7">
                  <span className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r ${persona.gradient} px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-[1.02]`}>
                    {persona.cta}
                    <ShieldCheck size={16} />
                  </span>
                </div>
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 text-center text-xs text-slate-600"
        >
          © 2026 StadiumSphere AI · FIFA World Cup 2026 Operations Platform
        </motion.p>
      </div>
    </div>
  );
}
