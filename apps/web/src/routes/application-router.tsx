import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation } from 'react-router';
import type { ComponentType } from 'react';

import { ApplicationShell } from '@/layouts/application-shell';
import { useAuth } from '@/contexts/auth-context';
import { applicationPages } from '@/routes/route-definitions';

/* ─── Lazy page imports ─── */

const PersonaPage = lazy(async () => import('@/pages/persona-page').then((m) => ({ default: m.PersonaPage })));
const LoginPage = lazy(async () => import('@/pages/login-page').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(async () => import('@/pages/signup-page').then((m) => ({ default: m.SignupPage })));

const DashboardPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.DashboardPage })));
const AnalyticsPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.AnalyticsPage })));
const ActivityPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.ActivityPage })));
const AssistantPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.AssistantPage })));
const SettingsPage = lazy(async () => import('@/pages/settings-page').then((module) => ({ default: module.SettingsPage })));
const HelpPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.HelpPage })));
const AboutPage = lazy(async () => import('@/pages/workspace-pages').then((module) => ({ default: module.AboutPage })));
const OrganizationsPage = lazy(async () => import('@/features/operations/organizations-page').then((module) => ({ default: module.OrganizationsPage })));
const StadiumsPage = lazy(async () => import('@/features/operations/stadiums-page').then((module) => ({ default: module.StadiumsPage })));
const VenuesPage = lazy(async () => import('@/features/operations/venues-page').then((module) => ({ default: module.VenuesPage })));
const SportsPage = lazy(async () => import('@/features/operations/sports-page').then((module) => ({ default: module.SportsPage })));
const TeamsPage = lazy(async () => import('@/features/operations/teams-page').then((module) => ({ default: module.TeamsPage })));
const EventsPage = lazy(async () => import('@/features/operations/events-page').then((module) => ({ default: module.EventsPage })));
const BookingsPage = lazy(async () => import('@/features/operations/bookings-page').then((module) => ({ default: module.BookingsPage })));

const productPages: Record<string, ComponentType> = {
  '/': DashboardPage,
  '/activity': ActivityPage,
  '/ai-assistant': AssistantPage,
  '/analytics': AnalyticsPage,
  '/about': AboutPage,
  '/bookings': BookingsPage,
  '/events': EventsPage,
  '/help': HelpPage,
  '/organizations': OrganizationsPage,
  '/settings': SettingsPage,
  '/sports': SportsPage,
  '/stadiums': StadiumsPage,
  '/teams': TeamsPage,
  '/venues': VenuesPage,
};

/* ─── Route guards ─── */

function RouteLoading() {
  return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-500 dark:text-slate-300">Preparing workspace…</div>;
}

function AuthLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950">
      <div className="grid justify-items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-2xl font-bold text-white shadow-xl shadow-cyan-500/25">S</span>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-400" />
        </div>
        <p className="text-sm text-slate-400">Restoring your session…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/persona" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function WorkspaceRoute() {
  const { pathname } = useLocation();
  const Page = productPages[pathname] ?? DashboardPage;
  return <Suspense fallback={<RouteLoading />}><Page /></Suspense>;
}

/* ─── Router ─── */

export const applicationRouter = createBrowserRouter([
  /* Public auth routes */
  {
    path: '/persona',
    element: <Suspense fallback={<AuthLoading />}><PublicOnlyRoute><PersonaPage /></PublicOnlyRoute></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={<AuthLoading />}><PublicOnlyRoute><LoginPage /></PublicOnlyRoute></Suspense>,
  },
  {
    path: '/signup',
    element: <Suspense fallback={<AuthLoading />}><PublicOnlyRoute><SignupPage /></PublicOnlyRoute></Suspense>,
  },
  /* Protected workspace routes */
  {
    element: <ProtectedRoute><ApplicationShell /></ProtectedRoute>,
    children: applicationPages.map((page) => ({
      element: <WorkspaceRoute />,
      path: page.path,
    })),
  },
]);
