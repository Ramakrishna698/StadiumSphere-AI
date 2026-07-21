import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleHelp,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Trophy,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuth, useIsAdmin } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';
import { getPage, getPagesForRole, routePaths } from '@/routes/route-definitions';
import type { ApplicationPage } from '@/routes/route-definitions';

const navigationIcons: Record<string, LucideIcon> = {
  Activity,
  'AI Assistant': Bot,
  Analytics: Sparkles,
  Bookings: CalendarDays,
  Dashboard: LayoutDashboard,
  Events: Trophy,
  Help: CircleHelp,
  Organizations: Building2,
  Settings: Settings2,
  Sports: Trophy,
  Stadiums: Building2,
  Teams: Activity,
  Venues: Building2,
};

export function ApplicationShell() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const page = getPage(pathname);
  const { show } = useToast();

  const visiblePages = getPagesForRole(user?.role);
  const primaryNavigation = visiblePages.filter((p) => p.path !== '/about' && p.path !== '/help');
  const supportNavigation = visiblePages.filter((p) => p.path === '/about' || p.path === '/help');

  const personaLabel = isAdmin ? 'Operations Manager' : 'Fan / Volunteer';
  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'OP';

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    void navigate('/persona', { replace: true });
  };

  useEffect(() => {
    setMobileNavigationOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#07111f] dark:text-slate-100">
      <AnimatePresence>{mobileNavigationOpen ? <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" aria-label="Close navigation" onClick={() => setMobileNavigationOpen(false)} className="fixed inset-0 z-30 bg-slate-950/45 lg:hidden" /> : null}</AnimatePresence>
      <Sidebar collapsed={collapsed} mobileOpen={mobileNavigationOpen} onCollapse={() => setCollapsed((value) => !value)} primaryNavigation={primaryNavigation} supportNavigation={supportNavigation} personaLabel={personaLabel} />
      <div className={`min-h-screen transition-[margin] duration-300 ${collapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <TopNavigation
          pageLabel={page.label}
          onMenu={() => setMobileNavigationOpen(true)}
          onSearch={() => setSearchOpen(true)}
          onNotifications={() => setNotificationsOpen(true)}
          onProfile={() => setProfileOpen((value) => !value)}
          profileOpen={profileOpen}
          onToast={show}
          userInitials={userInitials}
          userEmail={user?.email}
          personaLabel={personaLabel}
          onLogout={handleLogout}
        />
        <main><Outlet /></main>
        <footer className="flex flex-col gap-2 border-t border-slate-200/80 px-6 py-5 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 StadiumSphere AI · World Cup Operations Platform</span>
          <button type="button" onClick={() => show('Platform status is available from the API health endpoint.')} className="focus-ring w-fit rounded text-cyan-700 hover:text-cyan-900 dark:text-cyan-300">Platform status</button>
        </footer>
      </div>
      <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} type="button" aria-label="Open global search" onClick={() => setSearchOpen(true)} className="focus-ring fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 shadow-xl shadow-cyan-500/30"><Plus size={22} /></motion.button>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationDrawer open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

function Sidebar({ collapsed, mobileOpen, onCollapse, primaryNavigation, supportNavigation, personaLabel }: { collapsed: boolean; mobileOpen: boolean; onCollapse(): void; primaryNavigation: readonly ApplicationPage[]; supportNavigation: readonly ApplicationPage[]; personaLabel: string }) {
  return (
    <motion.aside animate={mobileOpen ? { x: 0, width: collapsed ? 80 : 288 } : { width: collapsed ? 80 : 288 }} transition={{ duration: .24, ease: 'easeOut' }} className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/80 bg-white/96 p-4 backdrop-blur-md transition-transform duration-300 dark:border-white/10 dark:bg-[#0a1729]/96 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
      <div className="mb-7 flex items-center justify-between gap-3 px-2">
        <NavLink to={routePaths.application.dashboard} className="focus-ring flex min-w-0 items-center gap-3 rounded-xl">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-lg font-bold text-white shadow-lg shadow-cyan-500/25">S</span>
          {!collapsed ? <span className="truncate text-sm font-semibold tracking-wide text-slate-950 dark:text-white">STADIUMSPHERE</span> : null}
        </NavLink>
        <button type="button" aria-label="Toggle sidebar" onClick={onCollapse} className="focus-ring hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 lg:block"><ChevronLeft size={18} className={collapsed ? 'rotate-180' : ''} /></button>
      </div>
      <nav aria-label="Primary navigation" className="scrollbar-thin flex-1 space-y-1 overflow-y-auto">
        <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>Operations</p>
        {primaryNavigation.map((item) => <NavigationLink key={item.path} item={item} collapsed={collapsed} />)}
        <p className={`mb-2 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>Workspace</p>
        {supportNavigation.map((item) => <NavigationLink key={item.path} item={item} collapsed={collapsed} />)}
      </nav>
      <div className={`mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 ${collapsed ? 'lg:hidden' : ''}`}>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">World Cup 2026</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{personaLabel}</p>
      </div>
    </motion.aside>
  );
}

function NavigationLink({ item, collapsed }: { item: ApplicationPage; collapsed: boolean }) {
  const Icon = navigationIcons[item.label] ?? Command;
  return <NavLink to={item.path} title={collapsed ? item.label : undefined} className={({ isActive }) => `focus-ring group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive ? 'bg-cyan-500/12 font-medium text-cyan-700 dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white'} ${collapsed ? 'lg:justify-center lg:px-2' : ''}`}><Icon aria-hidden="true" size={17} strokeWidth={1.8} className="shrink-0" /><span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span></NavLink>;
}

function TopNavigation({ pageLabel, onMenu, onSearch, onNotifications, onProfile, profileOpen, onToast, userInitials, userEmail, personaLabel, onLogout }: { pageLabel: string; onMenu(): void; onSearch(): void; onNotifications(): void; onProfile(): void; profileOpen: boolean; onToast(message: string): void; userInitials: string; userEmail?: string | undefined; personaLabel: string; onLogout(): void | Promise<void> }) {
  const { preference, setPreference } = useTheme();
  const nextTheme = preference === 'light' ? 'dark' : preference === 'dark' ? 'system' : 'light';
  const ThemeIcon = preference === 'dark' ? Moon : preference === 'light' ? Sun : Command;
  return <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#07111f]/80 sm:px-6 lg:px-8"><button type="button" aria-label="Open navigation" onClick={onMenu} className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"><Menu size={19} /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{pageLabel}</p><p className="hidden text-xs text-slate-500 sm:block">{personaLabel} / {pageLabel}</p></div><button type="button" onClick={() => onToast('Workspace selector is ready for multi-workspace support.')} className="focus-ring hidden rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10 md:block">Global Operations ⌄</button><button type="button" aria-label="Open global search" onClick={onSearch} className="focus-ring flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm hover:border-cyan-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><Search size={16} /><span className="hidden sm:inline">Search&nbsp;&nbsp;⌘K</span></button><button type="button" aria-label="Change theme" onClick={() => setPreference(nextTheme)} className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10"><ThemeIcon size={18} /></button><button type="button" aria-label="Open notifications" onClick={onNotifications} className="focus-ring relative rounded-lg p-2 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10"><Bell size={18} /><span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-400" /></button><div className="relative"><button type="button" aria-label="Open profile menu" onClick={onProfile} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-xs font-bold text-white">{userInitials}</button>{profileOpen ? <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-900"><div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">{userEmail ?? 'Operations User'}<br /><span className="font-semibold text-slate-700 dark:text-slate-200">{personaLabel}</span></div><div className="my-1 border-t border-slate-100 dark:border-white/10" /><NavLink to={routePaths.application.settings} role="menuitem" className="focus-ring block rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-white/10">Workspace settings</NavLink><button type="button" role="menuitem" onClick={onLogout} className="focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-400/10"><LogOut size={14} />Sign out</button></div> : null}</div></header>;
}

function SearchDialog({ open, onClose }: { open: boolean; onClose(): void }) {
  const { show } = useToast();

  if (!open) return null;

  return <div role="dialog" aria-modal="true" aria-label="Global search" className="fixed inset-0 z-50 grid place-items-start bg-slate-950/45 p-4 pt-24" onMouseDown={onClose}>
    <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-white/10 dark:bg-slate-900" onMouseDown={(event) => event.stopPropagation()}>
      <input autoFocus aria-label="Search workspace" placeholder="Search the workspace" className="focus-ring w-full rounded-xl bg-slate-100 px-4 py-3 text-sm outline-none dark:bg-white/10" />
      <button type="button" onClick={() => { show('Search submitted to the workspace command center.'); onClose(); }} className="focus-ring mt-3 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">Search workspace</button>
    </div>
  </div>;
}

function NotificationDrawer({ open, onClose }: { open: boolean; onClose(): void }) { if (!open) return null; return <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Notifications"><button type="button" aria-label="Close notifications" onClick={onClose} className="absolute inset-0 bg-slate-950/35" /><section className="drawer-enter absolute right-0 top-0 h-full w-full max-w-sm border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"><div className="flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><button type="button" aria-label="Close notification drawer" onClick={onClose} className="focus-ring rounded-lg p-2"><X size={18} /></button></div><div className="mt-8 rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-white/15 dark:text-slate-300">Your operational notification center is ready for future events.</div></section></div>; }
