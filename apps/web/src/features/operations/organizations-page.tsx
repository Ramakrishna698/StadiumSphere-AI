import { Building2, Download, MoreHorizontal, Plus, Search, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ConfirmationDialog, GlassCard, MetricCard, PremiumButton } from '@/components/design-system';
import { useIsAdmin } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import type { OrganizationRecord } from '@/types/api';

import { DataState, EmptyResource, OperationsPage, ResourceDrawer, ResourceFormDialog, safeText } from './operations-ui';
import { useResourceCollection } from './use-resource-collection';

const organizationFields = [
  { label: 'Organization name', name: 'name', placeholder: 'e.g. FIFA Operations', required: true },
] as const;

export function OrganizationsPage() {
  const organizations = useResourceCollection<OrganizationRecord, { name: string }, { name?: string }>('organizations');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<OrganizationRecord | null>(null);
  const { show } = useToast();
  const isAdmin = useIsAdmin();
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return (organizations.data ?? []).filter((organization) =>
      safeText(organization.name, '').toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [organizations.data, query]);

  const create = (values: Record<string, string>) => organizations.create.mutate(
    { name: safeText(values.name, '') },
    {
      onError: (error) => show(error instanceof Error ? error.message : 'Organization could not be created.'),
      onSuccess: () => { setCreateOpen(false); show('Organization created and synchronized.'); },
    },
  );
  const update = (values: Record<string, string>) => {
    if (selected === null) return;
    organizations.update.mutate(
      { id: selected.id, input: { name: safeText(values.name, safeText(selected.name)) } },
      {
        onError: (error) => show(error instanceof Error ? error.message : 'Organization could not be updated.'),
        onSuccess: () => { setEditOpen(false); setSelected(null); show('Organization profile updated.'); },
      },
    );
  };
  const remove = () => {
    if (selected === null) return;
    organizations.remove.mutate(selected.id, {
      onError: (error) => show(error instanceof Error ? error.message : 'Organization could not be deleted.'),
      onSuccess: () => { setDeleteOpen(false); setSelected(null); show('Organization removed from the workspace.'); },
    });
  };

  return <OperationsPage eyebrow="Enterprise command" icon={Building2} title="Organizations" description="Coordinate the organizations responsible for every matchday, venue, and operational decision." action={isAdmin ? <div className="flex flex-wrap gap-2"><PremiumButton variant="outline" onClick={() => show('The organization export is being prepared for download.')}><Download size={16} />Export</PremiumButton><PremiumButton variant="secondary" onClick={() => setCreateOpen(true)}><Plus size={16} />New organization</PremiumButton></div> : undefined}>
    <DataState title="Organizations" isLoading={organizations.isLoading} error={organizations.error} onRetry={() => void organizations.refetch()}>
      <section className="grid gap-4 md:grid-cols-3"><MetricCard label="Connected organizations" value={String(organizations.data?.length ?? 0)} trend={{ positive: true, value: 'Live registry' }} /><MetricCard label="Executive workspaces" value={String(filtered.length)} trend={{ positive: true, value: 'In view' }} /><GlassCard className="p-5"><p className="ss-kicker text-slate-400">Management posture</p><p className="mt-3 text-xl font-semibold tracking-[-.03em]">Centralized</p><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Each organization opens a focused profile without leaving the operational workspace.</p></GlassCard></section>
      <section className="ss-surface rounded-2xl"><div className="flex flex-col gap-4 border-b border-slate-200/80 p-5 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between"><div><p className="ss-kicker text-slate-400">Organization directory</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Executive workspace registry</h2></div><label className="relative w-full max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search organizations" placeholder="Search organizations" className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none focus:border-cyan-300 dark:border-white/10 dark:bg-white/5" /></label></div>
        {filtered.length === 0 ? <div className="p-6"><EmptyResource icon={UsersRound} title="No organizations in view" description="Create the first organization or adjust the directory search." action={<PremiumButton variant="secondary" onClick={() => setCreateOpen(true)}><Plus size={16} />Create organization</PremiumButton>} /></div> : <div className="grid divide-y divide-slate-100 dark:divide-white/[.07]">{filtered.map((organization, index) => { const name = safeText(organization.name); return <button type="button" key={organization.id} onClick={() => setSelected(organization)} className="group flex items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-cyan-50/50 dark:hover:bg-cyan-400/[.045]"><span className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-xs font-bold text-white dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950">{name.slice(0, 2).toUpperCase()}</span><span className="min-w-0"><span className="block truncate font-semibold">{name}</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">Enterprise workspace · Registry {String(index + 1).padStart(2, '0')}</span></span></span><span className="flex items-center gap-3"><span className="hidden rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline dark:text-emerald-300">Active</span><MoreHorizontal size={18} className="text-slate-400 transition group-hover:text-cyan-600 dark:group-hover:text-cyan-300" /></span></button>; })}</div>}</section>
    </DataState>
    <ResourceFormDialog fields={organizationFields} open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={create} submitting={organizations.create.isPending} title="Create organization" />
    <ResourceFormDialog fields={organizationFields} initialValues={selected === null ? {} : { name: safeText(selected.name) }} open={editOpen} onClose={() => setEditOpen(false)} onSubmit={update} submitting={organizations.update.isPending} submitLabel="Save changes" title="Edit organization" />
    <ResourceDrawer open={selected !== null} onClose={() => setSelected(null)} title={selected === null ? 'Organization profile' : safeText(selected.name)}>{selected !== null ? <div className="space-y-6"><div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white dark:from-cyan-400 dark:to-blue-500 dark:text-slate-950"><p className="text-xs font-bold uppercase tracking-[.16em] opacity-70">Organization profile</p><p className="mt-3 text-2xl font-semibold tracking-[-.04em]">{safeText(selected.name)}</p><p className="mt-2 text-sm opacity-75">Enterprise operational headquarters</p></div>{isAdmin ? <div className="grid gap-3"><PremiumButton variant="outline" onClick={() => setEditOpen(true)}>Edit organization</PremiumButton><PremiumButton variant="danger" onClick={() => setDeleteOpen(true)}>Delete organization</PremiumButton></div> : null}</div> : null}</ResourceDrawer>
    <ConfirmationDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={remove} confirmLabel="Delete organization" title="Delete this organization?" description="This action removes the organization from the current workspace and cannot be undone." />
  </OperationsPage>;
}
