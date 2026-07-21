import { useState } from 'react';
import { BellRing, KeyRound, LogOut, Palette, SlidersHorizontal, User, Users } from 'lucide-react';

import { GlassCard, PremiumButton, SegmentedControl, SelectInput, TextInput, Toggle } from '@/components/design-system';
import { useAuth, useIsAdmin } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useToast } from '@/contexts/toast-context';

type SettingsSection = 'Accessibility' | 'Appearance' | 'Notifications' | 'Profile' | 'Security' | 'Workspace';

interface SectionDefinition {
  icon: typeof Palette;
  name: SettingsSection;
  /** If true, only admin/manager users see this section. */
  adminOnly?: boolean;
}

const allSections: readonly SectionDefinition[] = [
  { icon: Palette, name: 'Appearance' },
  { icon: Users, name: 'Workspace', adminOnly: true },
  { icon: BellRing, name: 'Notifications' },
  { icon: SlidersHorizontal, name: 'Accessibility' },
  { icon: KeyRound, name: 'Security', adminOnly: true },
  { icon: User, name: 'Profile' },
];

export function SettingsPage() {
  const { preference, setPreference } = useTheme();
  const { show } = useToast();
  const { logout, user } = useAuth();
  const isAdmin = useIsAdmin();
  const visibleSections = isAdmin ? allSections : allSections.filter((s) => s.adminOnly !== true);
  const [section, setSection] = useState<SettingsSection>('Appearance');
  const [workspace, setWorkspace] = useState({ language: 'English (International)', name: 'Global Operations', organization: 'StadiumSphere AI', region: 'Americas', timezone: 'America/New_York' });
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    isAdmin
      ? { bookings: true, email: true, events: true, push: false, sms: false, system: true }
      : { crowd: true, emergency: true, matchReminders: true, transportation: true },
  );
  const [accessibility, setAccessibility] = useState({ colorAccessibility: false, contrast: false, keyboard: true, motion: false, screenReader: false });
  const [profile, setProfile] = useState({ language: 'English (International)' });

  const navigation = <>{visibleSections.map(({ icon: Icon, name }) => <button key={name} type="button" onClick={() => setSection(name)} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${section === name ? 'bg-cyan-500/12 text-cyan-800 dark:text-cyan-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'}`}><Icon size={17} className="text-cyan-500" />{name}</button>)}</>;
  const save = (label: string) => show(`${label} preferences saved to this workspace.`);

  let panel: React.ReactNode;
  if (section === 'Appearance') {
    panel = <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Appearance</p><h2 className="mt-2 text-lg font-semibold">Choose a workspace theme</h2><div className="mt-5"><SegmentedControl options={['light', 'dark', 'system']} value={preference} onChange={(value) => setPreference(value as typeof preference)} /></div><p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">The selected theme is persisted locally and applied to every workspace surface.</p></GlassCard><SaveBar label="Appearance" onSave={() => save('Appearance')} /></div>;
  } else if (section === 'Workspace') {
    panel = <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Workspace identity</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><TextInput label="Workspace name" value={workspace.name} onChange={(event) => setWorkspace({ ...workspace, name: event.target.value })} /><TextInput label="Organization" value={workspace.organization} onChange={(event) => setWorkspace({ ...workspace, organization: event.target.value })} /><SelectInput label="Timezone" value={workspace.timezone} onChange={(event) => setWorkspace({ ...workspace, timezone: event.target.value })}><option value="America/New_York">America / New York</option><option value="Europe/London">Europe / London</option><option value="Asia/Kolkata">Asia / Kolkata</option></SelectInput><SelectInput label="Language" value={workspace.language} onChange={(event) => setWorkspace({ ...workspace, language: event.target.value })}><option>English (International)</option><option>Spanish</option><option>French</option></SelectInput><SelectInput label="Region" value={workspace.region} onChange={(event) => setWorkspace({ ...workspace, region: event.target.value })}><option>Americas</option><option>EMEA</option><option>APAC</option></SelectInput></div></GlassCard><SaveBar label="Workspace" onSave={() => save('Workspace')} /></div>;
  } else if (section === 'Notifications') {
    panel = isAdmin
      ? <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Delivery channels</p><div className="mt-5 grid gap-3"><Toggle checked={notifications.email ?? false} label="Email notifications" onChange={(email) => setNotifications({ ...notifications, email })} /><Toggle checked={notifications.sms ?? false} label="SMS notifications" onChange={(sms) => setNotifications({ ...notifications, sms })} /><Toggle checked={notifications.push ?? false} label="Push notifications" onChange={(push) => setNotifications({ ...notifications, push })} /></div></GlassCard><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Operational signals</p><div className="mt-5 grid gap-3"><Toggle checked={notifications.bookings ?? false} label="Booking alerts" onChange={(bookings) => setNotifications({ ...notifications, bookings })} /><Toggle checked={notifications.events ?? false} label="Event alerts" onChange={(events) => setNotifications({ ...notifications, events })} /><Toggle checked={notifications.system ?? false} label="System notifications" onChange={(system) => setNotifications({ ...notifications, system })} /></div></GlassCard><SaveBar label="Notification" onSave={() => save('Notification')} /></div>
      : <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Fan notifications</p><h2 className="mt-2 text-lg font-semibold">Stay informed during matchday</h2><div className="mt-5 grid gap-3"><Toggle checked={notifications.matchReminders ?? true} label="Match reminders" onChange={(matchReminders) => setNotifications({ ...notifications, matchReminders })} /><Toggle checked={notifications.transportation ?? true} label="Transportation alerts" onChange={(transportation) => setNotifications({ ...notifications, transportation })} /><Toggle checked={notifications.crowd ?? true} label="Crowd notifications" onChange={(crowd) => setNotifications({ ...notifications, crowd })} /><Toggle checked={notifications.emergency ?? true} label="Emergency alerts" onChange={(emergency) => setNotifications({ ...notifications, emergency })} /></div></GlassCard><SaveBar label="Notification" onSave={() => save('Notification')} /></div>;
  } else if (section === 'Accessibility') {
    panel = <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Reading and motion</p><div className="mt-5 grid gap-4"><SelectInput label="Font size" defaultValue="Standard"><option>Compact</option><option>Standard</option><option>Comfortable</option></SelectInput><Toggle checked={accessibility.contrast} label="High contrast mode" onChange={(contrast) => setAccessibility({ ...accessibility, contrast })} /><Toggle checked={accessibility.motion} label="Reduced motion" onChange={(motion) => setAccessibility({ ...accessibility, motion })} /></div></GlassCard><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Navigation assistance</p><div className="mt-5 grid gap-3"><Toggle checked={accessibility.keyboard} label="Keyboard navigation hints" onChange={(keyboard) => setAccessibility({ ...accessibility, keyboard })} /><Toggle checked={accessibility.screenReader} label="Screen reader mode" onChange={(screenReader) => setAccessibility({ ...accessibility, screenReader })} /><Toggle checked={accessibility.colorAccessibility} label="Color accessibility" onChange={(colorAccessibility) => setAccessibility({ ...accessibility, colorAccessibility })} /></div></GlassCard><SaveBar label="Accessibility" onSave={() => save('Accessibility')} /></div>;
  } else if (section === 'Profile') {
    const personaLabel = isAdmin ? 'Tournament Operations Manager' : 'Fan / Volunteer';
    panel = <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Your profile</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><TextInput label="Email" value={user?.email ?? ''} readOnly /><TextInput label="Persona" value={personaLabel} readOnly /><SelectInput label="Language" value={profile.language} onChange={(event) => setProfile({ ...profile, language: event.target.value })}><option>English (International)</option><option>Spanish</option><option>French</option><option>Portuguese</option><option>Arabic</option></SelectInput></div></GlassCard><GlassCard className="p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">Sign out</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">End your current session and return to the persona selection.</p></div><PremiumButton variant="outline" onClick={() => void logout()}><LogOut size={16} />Sign out</PremiumButton></div></GlassCard><SaveBar label="Profile" onSave={() => save('Profile')} /></div>;
  } else {
    panel = <div className="grid gap-5"><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Password and protection</p><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">Password security</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Use a unique, high-strength password for this workspace account.</p></div><PremiumButton variant="outline" onClick={() => show('Password management is available through the identity service.')}>Manage password</PremiumButton></div><div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-white/10"><p className="font-semibold">Two-factor authentication</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Additional identity verification can be configured by your administrator.</p></div></GlassCard><GlassCard className="p-6"><p className="ss-kicker text-slate-400">Sessions and tokens</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="font-semibold">Active sessions</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">Current browser · Last login: this session</p></div><div><p className="font-semibold">API token status</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-300">No personal API token is active.</p></div></div><button type="button" onClick={() => show('All-device sign-out requires confirmation from the identity service.')} className="focus-ring mt-6 text-sm font-semibold text-rose-700 dark:text-rose-300">Sign out all devices</button></GlassCard><SaveBar label="Security" onSave={() => save('Security')} /></div>;
  }

  return <main className="page-enter mx-auto w-full max-w-[1440px] space-y-7 px-4 py-6 sm:px-6 lg:px-8"><header className="max-w-3xl"><p className="ss-kicker text-cyan-700 dark:text-cyan-200">{isAdmin ? 'Workspace preferences' : 'Your preferences'}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.05em] text-slate-950 sm:text-4xl dark:text-white">Settings</h1><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{isAdmin ? 'Tune the StadiumSphere workspace for the way your operations team reviews, responds, and collaborates.' : 'Personalize your World Cup experience — appearance, notifications, accessibility, and profile.'}</p></header><section className="grid gap-5 xl:grid-cols-[15rem_1fr]"><GlassCard className="h-fit p-3"><nav aria-label="Settings sections" className="grid gap-1">{navigation}</nav></GlassCard><section aria-label={`${section} settings`}>{panel}</section></section></main>;
}

function SaveBar({ label, onSave }: { label: string; onSave(): void }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[.035]"><p className="text-sm text-slate-500 dark:text-slate-300">Changes apply to this browser workspace.</p><PremiumButton variant="secondary" onClick={onSave}>Save {label}</PremiumButton></div>;
}
