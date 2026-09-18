'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RelationshipCard, { type RelationshipSummary } from '@/components/relationships/RelationshipCard';
import EmptyRelationalField from '@/components/relationships/EmptyRelationalField';
import CreateRelationshipModal from '@/components/relationships/CreateRelationshipModal';

type Realm = 'outer' | 'inner' | 'transpersonal';

const isSystemHoldingField = (relationship: RelationshipSummary) =>
  relationship.name.trim().toLowerCase() === 'unresolved relational field';

const REALM_HEADERS: Record<Realm, { title: string; subtitle: string }> = {
  outer: {
    title: 'People in your life',
    subtitle: 'Relationships you have chosen to bring into view.',
  },
  inner: {
    title: 'Inner figures',
    subtitle: 'Parts, archetypes, and inner presences you are in relationship with.',
  },
  transpersonal: {
    title: 'The larger field',
    subtitle: 'Vocation, nature, ancestors, the sacred, and what exceeds the personal.',
  },
};

export default function RelationshipFieldPage() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<RelationshipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createRealm, setCreateRealm] = useState<Realm | undefined>();

  const fetchRelationships = useCallback(async () => {
    try {
      const res = await fetch('/api/relationships');
      const data = await res.json();
      if (data.success) {
        setRelationships(data.relationships);
      }
    } catch (err) {
      console.error('[RelationshipField] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const handleCreated = (rel: { id: string; name: string; realm: Realm }) => {
    setShowCreate(false);
    setCreateRealm(undefined);
    router.push(`/relationships/${rel.id}`);
  };

  const openCreateForRealm = (realm: Realm) => {
    setCreateRealm(realm);
    setShowCreate(true);
  };

  const visibleRelationships = relationships.filter((relationship) => !isSystemHoldingField(relationship));
  const systemHoldingFields = relationships.filter(isSystemHoldingField);

  const grouped = visibleRelationships.reduce<Record<Realm, RelationshipSummary[]>>((acc, r) => {
    const realm = (r.realm || 'outer') as Realm;
    if (!acc[realm]) acc[realm] = [];
    acc[realm].push(r);
    return acc;
  }, { outer: [], inner: [], transpersonal: [] });

  const hasAny = visibleRelationships.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-jade-sage/30 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: 'var(--jade-jade, #a8c7a0)' }} />
          <p className="text-sm text-jade-mineral font-light tracking-wide">Opening your relationships...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f4eee4] text-[#30342f]"
      data-relational-warm-field
    >
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(229,210,181,0.66),transparent_34%),radial-gradient(circle_at_82%_34%,rgba(188,204,173,0.34),transparent_34%),linear-gradient(180deg,#f8f3eb_0%,#f0e7dc_100%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl px-6 py-12 md:py-16">
        <button
          onClick={() => router.push('/maia')}
          className="mb-10 flex items-center gap-1 text-xs text-[#716d64] transition-colors hover:text-[#4f6652]"
        >
          <span className="text-[10px]">←</span> Back to MAIA
        </button>

        <header className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#6d7863]">Relationships</p>
          <h1 className="mb-4 text-4xl font-extralight tracking-wide text-[#3f5544] md:text-5xl">
            Who is present for you?
          </h1>
          <p className="max-w-2xl text-base font-light leading-relaxed text-[#625f57]">
            Bring a relationship into view. You do not need to know what it means yet.
          </p>
          <button
            onClick={() => { setCreateRealm(undefined); setShowCreate(true); }}
            className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#94a284]/35 bg-[#fffaf3]/90 px-5 py-3 text-sm font-light text-[#435845] shadow-[0_10px_30px_rgba(77,67,52,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#7f9273]/55 hover:bg-[#fffdf8]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e8efe1] text-base leading-none text-[#526a52]">+</span>
            Bring someone into view
          </button>
        </header>

        {!hasAny && (
          <EmptyRelationalField
            onAddPerson={() => openCreateForRealm('outer')}
            onAddInner={() => openCreateForRealm('inner')}
            onStartFromMind={() => { setCreateRealm(undefined); setShowCreate(true); }}
          />
        )}

        {hasAny && (
          <div className="space-y-14">
            {(Object.keys(REALM_HEADERS) as Realm[]).map((realm) => {
              const items = grouped[realm];
              if (!items || items.length === 0) return null;
              const header = REALM_HEADERS[realm];

              return (
                <section key={realm}>
                  <div className="mb-5">
                    <h2 className="text-sm font-light tracking-wide text-[#556b57]">{header.title}</h2>
                    <p className="mt-1 text-xs font-light leading-relaxed text-[#777269]">{header.subtitle}</p>
                  </div>
                  <div className="space-y-3">
                    {items.map((r) => (
                      <RelationshipCard
                        key={r.id}
                        relationship={r}
                        onClick={() => router.push(`/relationships/${r.id}`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {systemHoldingFields.length > 0 && (
              <aside className="rounded-[1.4rem] border border-[#b9b1a3]/45 bg-[#eee6da]/70 px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7b776e]">Unplaced relational threads</p>
                <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-[#69655d]">
                  A few observations have not yet found the relationship they belong to. They can wait here quietly until they make sense.
                </p>
                <div className="mt-4 space-y-2">
                  {systemHoldingFields.map((relationship) => (
                    <button
                      key={relationship.id}
                      onClick={() => router.push(`/relationships/${relationship.id}`)}
                      className="text-sm font-light text-[#526851] transition-colors hover:text-[#354638]"
                    >
                      Review when you are ready →
                    </button>
                  ))}
                </div>
              </aside>
            )}

            <div className="border-t border-[#cfc6b8] pt-8">
              <button
                onClick={() => { setCreateRealm(undefined); setShowCreate(true); }}
                className="text-sm font-light text-[#556b57] transition-colors hover:text-[#37493a]"
              >
                + Bring another relationship into view
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateRelationshipModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setCreateRealm(undefined); }}
        onCreated={handleCreated}
        initialRealm={createRealm}
      />
    </div>
  );
}
