'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RelationshipCard, { type RelationshipSummary } from '@/components/relationships/RelationshipCard';
import EmptyRelationalField from '@/components/relationships/EmptyRelationalField';
import CreateRelationshipModal from '@/components/relationships/CreateRelationshipModal';

type Realm = 'outer' | 'inner' | 'transpersonal';

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

  const grouped = relationships.reduce<Record<Realm, RelationshipSummary[]>>((acc, r) => {
    const realm = (r.realm || 'outer') as Realm;
    if (!acc[realm]) acc[realm] = [];
    acc[realm].push(r);
    return acc;
  }, { outer: [], inner: [], transpersonal: [] });

  const hasAny = relationships.length > 0;

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
    <div className="min-h-screen relative">
      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <button
          onClick={() => router.push('/maia')}
          className="mb-10 flex items-center gap-1 text-xs text-stone-500 transition-colors hover:text-amber-400/80"
        >
          <span className="text-[10px]">←</span> Back to MAIA
        </button>

        <header className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-jade-mineral/55">Relationships</p>
          <h1 className="mb-4 text-4xl font-extralight tracking-wide text-jade-jade md:text-5xl">
            Who is present for you?
          </h1>
          <p className="max-w-xl text-base font-light leading-relaxed text-jade-mineral/80">
            Bring a relationship into view. You do not need to know what it means yet.
          </p>
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
                    <h2 className="text-sm font-light tracking-wide text-jade-sage">{header.title}</h2>
                    <p className="mt-1 text-xs font-light leading-relaxed text-jade-mineral/55">{header.subtitle}</p>
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

            <div className="border-t border-jade-sage/10 pt-8">
              <button
                onClick={() => { setCreateRealm(undefined); setShowCreate(true); }}
                className="text-sm font-light text-jade-sage transition-colors hover:text-jade-jade"
              >
                + Bring someone or something else into view
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
