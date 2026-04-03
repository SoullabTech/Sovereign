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
    router.push(`/dashboard/relationships/${rel.id}`);
  };

  const openCreateForRealm = (realm: Realm) => {
    setCreateRealm(realm);
    setShowCreate(true);
  };

  // Group by realm
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
          <p className="text-sm text-jade-mineral font-light tracking-wide">Loading relational field...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extralight text-jade-jade tracking-wide mb-2">
              Relational Field
            </h1>
            <p className="text-sm text-jade-mineral font-light max-w-md">
              The living patterns of your relationships — outer and inner — made visible.
            </p>
          </div>
          {hasAny && (
            <button
              onClick={() => { setCreateRealm(undefined); setShowCreate(true); }}
              className="px-4 py-2 rounded-lg bg-jade-forest/30 border border-jade-sage/25 text-jade-jade text-sm font-light hover:bg-jade-forest/45 transition-all flex-shrink-0"
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
                  <h2 className="text-xs text-jade-sage uppercase tracking-wider mb-3">
                    {REALM_HEADERS[realm]}
                  </h2>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <RelationshipCard
                        key={r.id}
                        relationship={r}
                        onClick={() => router.push(`/dashboard/relationships/${r.id}`)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
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
