import { CircleDot, Layers3, Plus, Search, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';

import { GlassCard, MetricCard, PremiumButton } from '@/components/design-system';
import { useIsAdmin } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import type { SportRecord } from '@/types/api';

import { DataState, EmptyResource, OperationsPage, ResourceCrudControls, ResourceDrawer, ResourceFormDialog } from './operations-ui';
import { useResourceCollection } from './use-resource-collection';

const sportFields = [{ label: 'Sport name', name: 'name', placeholder: 'e.g. Football', required: true }] as const;
const accents = ['from-cyan-400 to-blue-500', 'from-violet-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-amber-300 to-orange-500'];

export function SportsPage() {
  const sports = useResourceCollection<SportRecord, { name: string }, { name?: string }>('sports');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<SportRecord | null>(null);
  const [query, setQuery] = useState('');
  const { show } = useToast();
  const isAdmin = useIsAdmin();
  const filtered = useMemo(() => (sports.data ?? []).filter((sport) => sport.name.toLowerCase().includes(query.toLowerCase())), [query, sports.data]);

  return <OperationsPage eyebrow="Competition catalogue" icon={Trophy} title="Sports" description="A curated competition catalogue that keeps every team, event, and operational workflow aligned to its sport." action={isAdmin ? <PremiumButton variant="secondary" onClick={() => setCreateOpen(true)}><Plus size={16} />Add sport</PremiumButton> : undefined}>
    <DataState title="Sports" isLoading={sports.isLoading} error={sports.error} onRetry={() => void sports.refetch()}>
      <section className="grid gap-4 md:grid-cols-3"><MetricCard label="Competition types" value={String(sports.data?.length ?? 0)} trend={{ positive: true, value: 'Catalogued' }} /><GlassCard className="p-5"><p className="ss-kicker text-slate-400">Distribution</p><p className="mt-3 text-xl font-semibold tracking-[-.03em]">Balanced</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Sport definitions become the shared language across team operations.</p></GlassCard><GlassCard className="p-5"><p className="ss-kicker text-slate-400">Catalog integrity</p><p className="mt-3 text-xl font-semibold tracking-[-.03em]">Protected</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Referenced sports remain protected by backend relationship validation.</p></GlassCard></section>
      <section className="ss-surface rounded-2xl p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="ss-kicker text-slate-400">Sports catalogue</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Competition landscape</h2></div><label className="relative w-full max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search sports" placeholder="Search the catalogue" className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none focus:border-cyan-300 dark:border-white/10 dark:bg-white/5" /></label></div>{filtered.length === 0 ? <div className="mt-6"><EmptyResource icon={CircleDot} title="No sports match this view" description="Add a competition type or clear the catalogue search." action={<PremiumButton variant="secondary" onClick={() => setCreateOpen(true)}><Plus size={16} />Add sport</PremiumButton>} /></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((sport, index) => <button type="button" key={sport.id} onClick={() => setSelected(sport)} className="ss-surface ss-interactive group rounded-2xl p-5 text-left"><span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${accents[index % accents.length]} text-white shadow-lg`}><Trophy size={21} /></span><h2 className="mt-6 text-lg font-semibold tracking-[-.03em]">{sport.name}</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">Competition definition available for team and event operations.</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-cyan-700 dark:text-slate-400 dark:group-hover:text-cyan-300"><Layers3 size={14} />Open catalogue detail</div></button>)}</div>}</section>
    </DataState>
    <ResourceFormDialog fields={sportFields} open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={(values) => sports.create.mutate({ name: values.name ?? '' }, { onError: (error) => show(error instanceof Error ? error.message : 'Sport could not be created.'), onSuccess: () => { setCreateOpen(false); show('Sport added to the competition catalogue.'); } })} submitting={sports.create.isPending} title="Add sport" />
    <ResourceDrawer open={selected !== null} onClose={() => setSelected(null)} title={selected?.name ?? 'Sport detail'}>{selected !== null ? <div className="space-y-6"><div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 text-white"><p className="ss-kicker opacity-70">Competition type</p><p className="mt-3 text-2xl font-semibold tracking-[-.04em]">{selected.name}</p><p className="mt-2 text-sm opacity-80">Used to organize teams and event activity.</p></div>{isAdmin ? <ResourceCrudControls fields={sportFields} initialValues={{ name: selected.name }} title="sport" updatePending={sports.update.isPending} removePending={sports.remove.isPending} onUpdate={(values) => sports.update.mutate({ id: selected.id, input: { name: values.name ?? selected.name } }, { onError: (error) => show(error instanceof Error ? error.message : 'Sport could not be updated.'), onSuccess: () => show('Sport catalogue entry updated.') })} onDelete={() => sports.remove.mutate(selected.id, { onError: (error) => show(error instanceof Error ? error.message : 'Sport cannot be removed while referenced.'), onSuccess: () => { setSelected(null); show('Sport removed from the catalogue.'); } })} deleteLabel="Remove sport" /> : null}</div> : null}</ResourceDrawer>
  </OperationsPage>;
}
