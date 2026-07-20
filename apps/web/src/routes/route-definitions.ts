export interface ApplicationPage {
  description: string;
  icon: string;
  label: string;
  path: string;
  /** Minimum role required to see this page in the sidebar. 'all' means any authenticated user. */
  access: 'admin' | 'all';
}

export const routePaths = {
  application: {
    activity: '/activity',
    aiAssistant: '/ai-assistant',
    analytics: '/analytics',
    bookings: '/bookings',
    dashboard: '/',
    events: '/events',
    help: '/help',
    organizations: '/organizations',
    settings: '/settings',
    sports: '/sports',
    stadiums: '/stadiums',
    teams: '/teams',
    venues: '/venues',
  },
  auth: {
    login: '/login',
    persona: '/persona',
    signup: '/signup',
  },
  public: {
    about: '/about',
  },
} as const;

export const applicationPages: readonly ApplicationPage[] = [
  { description: 'A real-time overview of your global stadium operations.', icon: '◈', label: 'Dashboard', path: routePaths.application.dashboard, access: 'all' },
  { description: 'Coordinate the organizations powering every matchday.', icon: '◎', label: 'Organizations', path: routePaths.application.organizations, access: 'admin' },
  { description: 'Operate world-class stadium infrastructure with confidence.', icon: '◇', label: 'Stadiums', path: routePaths.application.stadiums, access: 'all' },
  { description: 'Manage venue readiness, reservations, and operations.', icon: '⌘', label: 'Venues', path: routePaths.application.venues, access: 'admin' },
  { description: 'Configure the sports that shape your competition landscape.', icon: '◌', label: 'Sports', path: routePaths.application.sports, access: 'all' },
  { description: 'Keep team operations aligned across every competition.', icon: '◉', label: 'Teams', path: routePaths.application.teams, access: 'all' },
  { description: 'Plan and oversee every event from schedule to final whistle.', icon: '✦', label: 'Events', path: routePaths.application.events, access: 'all' },
  { description: 'Track the booking lifecycle with operational clarity.', icon: '▣', label: 'Bookings', path: routePaths.application.bookings, access: 'all' },
  { description: 'Explore intelligence-ready operational signals.', icon: '↗', label: 'Analytics', path: routePaths.application.analytics, access: 'all' },
  { description: 'Review a unified stream of platform decisions.', icon: '◫', label: 'Activity', path: routePaths.application.activity, access: 'admin' },
  { description: 'Prepare your operations team for assisted decision-making.', icon: '✺', label: 'AI Assistant', path: routePaths.application.aiAssistant, access: 'all' },
  { description: 'Tailor the StadiumSphere workspace to your operation.', icon: '⚙', label: 'Settings', path: routePaths.application.settings, access: 'admin' },
  { description: 'Find platform guidance and operational resources.', icon: '?', label: 'Help', path: routePaths.application.help, access: 'all' },
  { description: 'Learn about the StadiumSphere AI operations platform.', icon: 'i', label: 'About', path: routePaths.public.about, access: 'all' },
];

export function getPage(pathname: string): ApplicationPage {
  return applicationPages.find((page) => page.path === pathname) ?? applicationPages[0]!;
}

export function getPagesForRole(role: string | undefined): readonly ApplicationPage[] {
  if (role === 'ADMIN' || role === 'MANAGER') return applicationPages;
  return applicationPages.filter((page) => page.access === 'all');
}
