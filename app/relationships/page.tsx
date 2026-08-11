'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import RelationshipCard, { type RelationshipSummary } from '@/components/relationships/RelationshipCard';
import EmptyRelationalField from '@/components/relationships/EmptyRelationalField';
import CreateRelationshipModal from '@/components/relationships/CreateRelationshipModal';

type Realm = 'outer' | 'inner' | 'transpersonal';

const REALM_HEADERS: Record<Realm, string> = {
  outer: 'People in your life',
  inner: 'Inner figures',
  transpersonal: 'The larger field',
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

  // ── Infrastructure is not relationship ───────────────────────────────────
  //
  // The relational observer creates a container to hold conversation material
  // whose relationship it could not resolve. That container used to render in
  // "People in your life" alongside the member's actual people — the system's
  // own uncertainty wearing the face of a human being. That is a category
  // error, not a display bug.
  //
  // It is separated by PROVENANCE (`origin`), never by matching its name:
  // a name is renameable by the member and would silently break the boundary.
  // Nothing is deleted or hidden — everything inside stays reachable, shown as
  // what it actually is: the system's unfinished work, not a relationship.
  const people = relationships.filter((r) => r.origin !== 'system');
  const containers = relationships.filter((r) => r.origin === 'system');

  // Group by realm
  const grouped = people.reduce<Record<Realm, RelationshipSummary[]>>((acc, r) => {
    const realm = (r.realm || 'outer') as Realm;
    if (!acc[realm]) acc[realm] = [];
    acc[realm].push(r);
    return acc;
  }, { outer: [], inner: [], transpersonal: [] });

  const hasAny = people.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17]">
        <div className="text-center">
          <div className="w-8 h-8 border border-stone-700/30 rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#b4703a' }} />
          <p className="text-sm text-stone-400 font-light tracking-wide">Loading relational field...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-[#0a0e17]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <button
              type="button"
              onClick={() => router.push('/maia')}
              className="text-xs text-stone-500 hover:text-amber-400/80 transition-colors mb-3 flex items-center gap-1"
            >
              <span className="text-[10px]">&#8592;</span> Back to MAIA
            </button>
            <h1 className="text-3xl font-extralight text-stone-200 tracking-wide mb-2">
              Relational Field
            </h1>
            <p className="text-sm text-stone-400 font-light max-w-md">
              The living patterns of your relationships — outer and inner — made visible.
            </p>
          </div>
          {hasAny && (
            <button
              type="button"
              onClick={() => { setCreateRealm(undefined); setShowCreate(true); }}
              className="px-4 py-2 rounded-lg bg-stone-900/30 border border-stone-700/25 text-stone-200 text-sm font-light hover:bg-stone-900/45 transition-all flex-shrink-0"
            >
              + Add
            </button>
          )}
        </div>

        {/* Empty state */}
        {!hasAny && (
          <EmptyRelationalField
            onAddPerson={() => openCreateForRealm('outer')}
            onAddInner={() => openCreateForRealm('inner')}
            onStartFromMind={() => { setCreateRealm(undefined); setShowCreate(true); }}
          />
        )}

        {/* Grouped list */}
        {hasAny && (
          <div className="space-y-8">
            {(Object.keys(REALM_HEADERS) as Realm[]).map((realm) => {
              const items = grouped[realm];
              if (!items || items.length === 0) return null;
              return (
                <div key={realm}>
                  <h2 className="text-xs text-stone-300 uppercase tracking-wider mb-3">
                    {REALM_HEADERS[realm]}
                  </h2>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <RelationshipCard
                        key={r.id}
                        relationship={r}
                        onClick={() => router.push(`/relationships/${r.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* What the system has not been able to place. Named as the system's
            own unfinished work — never as a person, never among people. */}
        {containers.length > 0 && (
          <div className="mt-14 pt-6 border-t border-stone-800/20">
            <h2 className="text-xs text-stone-400/70 tracking-wide mb-2 font-light">
              Not yet placed
            </h2>
            <p className="text-xs text-stone-400/60 font-light mb-3 max-w-md leading-relaxed">
              Things you&apos;ve said in conversation that sounded relational, which we
              couldn&apos;t tell who they were about. This is our unfinished work, not a
              relationship — it&apos;s here so nothing of yours is lost.
            </p>
            <div className="space-y-2">
              {containers.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => router.push(`/relationships/${c.id}`)}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-dashed border-stone-800/40 bg-transparent hover:border-stone-700/30 transition-colors"
                >
                  <span className="text-sm text-stone-400/80 font-light">
                    Unplaced material
                  </span>
                </button>
              ))}
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
