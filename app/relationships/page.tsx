'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import CreateRelationshipModal from '@/components/relationships/CreateRelationshipModal';

type Realm = 'outer' | 'inner' | 'transpersonal';

interface RelationshipSummary {
  id: string;
  name: string;
  realm: Realm;
  bondType: string | null;
  note: string | null;
  fieldTone: string | null;
  activeSignals: string[] | null;
  lastCheckinAt: string | null;
  createdAt: string;
}

const isSystemHoldingField = (relationship: RelationshipSummary) =>
  relationship.name.trim().toLowerCase() === 'unresolved relational field';

const realmLabel: Record<Realm, string> = {
  outer: 'In your life',
  inner: 'Inner presence',
  transpersonal: 'Larger field',
};

function stableAccent(name: string) {
  const accents = [
    { wash: '#eef0e6', ring: '#aab59c', ink: '#506151' },
    { wash: '#f3e8dc', ring: '#c6a98f', ink: '#6a5545' },
    { wash: '#ebe9e0', ring: '#b4ad9d', ink: '#57594f' },
    { wash: '#ece8ee', ring: '#b6a9b8', ink: '#625664' },
    { wash: '#e8efec', ring: '#9eb3ab', ink: '#4b615a' },
  ];
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accents[total % accents.length];
}

function RelationshipPresence({
  relationship,
  onOpen,
}: {
  relationship: RelationshipSummary;
  onOpen: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const accent = stableAccent(relationship.name);
  const descriptor = relationship.bondType
    ? relationship.bondType.replace(/_/g, ' ')
    : realmLabel[relationship.realm];
  const initial = relationship.name.trim().charAt(0).toUpperCase() || '•';

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileHover={reduceMotion ? undefined : { y: -5 }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.22 }}
      className="group relative min-h-[220px] overflow-hidden rounded-[2rem] border border-[#d7cec0] bg-[#fffdf8] p-6 text-left shadow-[0_16px_50px_rgba(78,67,51,0.06)] transition-[border-color,box-shadow,background-color] hover:border-[#bbb09f] hover:bg-white hover:shadow-[0_22px_65px_rgba(78,67,51,0.10)] md:p-7"
      data-relationship-presence
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full blur-3xl"
        style={{ backgroundColor: accent.wash }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-base font-medium"
              style={{
                backgroundColor: accent.wash,
                borderColor: accent.ring,
                color: accent.ink,
              }}
              aria-hidden="true"
            >
              {initial}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-[1.35rem] font-medium tracking-[-0.015em] text-[#2f3c33]">
                {relationship.name}
              </h3>
              <p className="mt-1 text-xs font-medium capitalize tracking-[0.08em] text-[#766f65]">
                {descriptor}
              </p>
            </div>
          </div>

          <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#7c8d78] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div className="mt-7 flex-1">
          {relationship.note ? (
            <p className="max-w-[34rem] font-serif text-[1.03rem] leading-7 text-[#4c4d47]">
              “{relationship.note}”
            </p>
          ) : (
            <p className="text-sm leading-6 text-[#6f6e67]">
              Nothing needs to be explained yet. Enter when this relationship is present.
            </p>
          )}
        </div>

        <div className="mt-7 flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#586c58]">
          <span className="h-px w-7 bg-[#aeb9a7]" />
          Enter relationship
        </div>
      </div>
    </motion.button>
  );
}

export default function RelationshipFieldPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [relationships, setRelationships] = useState<RelationshipSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createRealm, setCreateRealm] = useState<Realm | undefined>();

  const fetchRelationships = useCallback(async () => {
    try {
      const response = await fetch('/api/relationships');
      const data = await response.json();
      if (data.success) setRelationships(data.relationships);
    } catch (error) {
      console.error('[RelationshipField] fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  const visibleRelationships = useMemo(
    () => relationships.filter((relationship) => !isSystemHoldingField(relationship)),
    [relationships]
  );

  const systemHoldingFields = useMemo(
    () => relationships.filter(isSystemHoldingField),
    [relationships]
  );

  const handleCreated = (relationship: { id: string; name: string; realm: Realm }) => {
    setShowCreate(false);
    setCreateRealm(undefined);
    router.push(`/relationships/${relationship.id}`);
  };

  const openArrival = (realm?: Realm) => {
    setCreateRealm(realm);
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e8]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-9 w-9 animate-pulse rounded-full border border-[#adb9a5] bg-[#edf1e8]" />
          <p className="text-sm font-medium text-[#626860]">Opening your relationships…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-[#2f342f]"
      data-relational-environment
    >
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_4%,rgba(225,205,176,0.48),transparent_32%),radial-gradient(circle_at_86%_14%,rgba(190,207,184,0.40),transparent_34%),radial-gradient(circle_at_58%_92%,rgba(222,202,187,0.32),transparent_32%)]" />
        <svg
          viewBox="0 0 1440 900"
          className="absolute inset-0 h-full w-full opacity-[0.42]"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M-80 220 C 240 90, 420 380, 760 250 S 1210 120, 1540 310" fill="none" stroke="#d9cbb9" strokeWidth="1.2" />
          <path d="M-40 650 C 260 500, 490 740, 760 590 S 1170 430, 1510 610" fill="none" stroke="#cfd6c8" strokeWidth="1.2" />
          <path d="M250 -80 C 390 180, 650 110, 760 330 S 980 610, 1240 470" fill="none" stroke="#e1d1c2" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-7 md:pt-10 lg:px-10">
        <button
          type="button"
          onClick={() => router.push('/maia')}
          className="mb-14 inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] text-[#716d64] transition-colors hover:text-[#465a49]"
        >
          <span aria-hidden="true">←</span>
          Back to MAIA
        </button>

        <section className="grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f7f69]">
              Relationships
            </p>
            <h1 className="max-w-[11ch] text-[clamp(3.2rem,7vw,6.4rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[#304239]">
              Who is here with you?
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#5c5d56]">
              Some relationships ask for attention. Some simply want to be remembered.
              Bring one closer when you are ready.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => openArrival()}
            whileHover={reduceMotion ? undefined : { y: -4 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            className="group relative overflow-hidden rounded-[2.2rem] border border-[#cdbfaa] bg-[#fbf5e9] p-7 text-left shadow-[0_20px_60px_rgba(86,69,48,0.08)] transition-all hover:border-[#af9f88] hover:bg-[#fffaf3]"
            data-bring-relationship-forward
          >
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#dde6d5] blur-3xl" aria-hidden="true" />
            <div className="relative">
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full border border-[#aab79f] bg-[#eaf0e4] text-[#48604b]">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-xl font-medium tracking-[-0.015em] text-[#34463a]">
                Bring someone into view
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#66645d]">
                A person, an inner presence, or something larger. You do not need to know what it means yet.
              </p>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.12em] text-[#657a62]">
                Begin here →
              </p>
            </div>
          </motion.button>
        </section>

        <div className="my-14 h-px bg-gradient-to-r from-transparent via-[#cec3b4] to-transparent md:my-16" />

        {visibleRelationships.length === 0 ? (
          <section className="mx-auto max-w-3xl py-10 text-center">
            <p className="font-serif text-2xl leading-9 text-[#454b45]">
              Your relational field begins with one presence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => openArrival('outer')}
                className="rounded-full border border-[#c8beaf] bg-[#fffaf5] px-5 py-3 text-sm font-medium text-[#465748]"
              >
                A person in my life
              </button>
              <button
                type="button"
                onClick={() => openArrival('inner')}
                className="rounded-full border border-[#c8beaf] bg-[#fffaf5] px-5 py-3 text-sm font-medium text-[#465748]"
              >
                An inner presence
              </button>
              <button
                type="button"
                onClick={() => openArrival('transpersonal')}
                className="rounded-full border border-[#c8beaf] bg-[#fffaf5] px-5 py-3 text-sm font-medium text-[#465748]"
              >
                Something larger
              </button>
            </div>
          </section>
        ) : (
          <section aria-labelledby="relationship-presences">
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7a786f]">
                  In your field
                </p>
                <h2
                  id="relationship-presences"
                  className="mt-2 text-2xl font-medium tracking-[-0.025em] text-[#344039]"
                >
                  The relationships you have brought close
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#6d6a62]">
                Enter anywhere. Nothing here needs to be solved before it can be met.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {visibleRelationships.map((relationship) => (
                <RelationshipPresence
                  key={relationship.id}
                  relationship={relationship}
                  onOpen={() => router.push(`/relationships/${relationship.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {systemHoldingFields.length > 0 && (
          <aside className="mt-14 border-t border-[#d6cdc0] pt-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#898176]">
                  Unplaced threads
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#69665f]">
                  A few observations have not yet found the relationship they belong to. They can remain here until something becomes clear.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push(`/relationships/${systemHoldingFields[0].id}`)}
                className="shrink-0 text-sm font-medium text-[#5c705b] transition-colors hover:text-[#354a39]"
              >
                Look when ready →
              </button>
            </div>
          </aside>
        )}
      </div>

      <CreateRelationshipModal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateRealm(undefined);
        }}
        onCreated={handleCreated}
        initialRealm={createRealm}
      />
    </div>
  );
}
