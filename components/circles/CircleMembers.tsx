'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

type MemberRow = {
  member_id: string;
  name: string | null;
  role: string;
  created_at: string;
};

export function CircleMembers({ circleId }: { circleId: string }) {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch(`/api/circles/${circleId}/members`);
        const json = await res.json();
        if (!cancelled) setMembers(json.members ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [circleId]);

  return (
    <div className="space-y-4">
      {/* Helper boundary statement */}
      <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
        <h3 className="text-sm font-semibold text-maia-ink-100">
          Helpers hold space; they don't oversee you
        </h3>
        <p className="mt-2 text-sm text-maia-ink-60">
          Helpers in this circle can see what you share into the circle feed. They cannot see your
          private Field, sessions, or MAIA conversations.
        </p>
      </div>

      {/* Member list */}
      <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-850 p-5">
        <h3 className="text-sm font-semibold text-maia-ink-100">Members</h3>

        {loading && (
          <p className="mt-3 text-sm text-maia-ink-40">Loading...</p>
        )}

        <div className="mt-3 space-y-2">
          {members.map((m) => (
            <div
              key={m.member_id}
              className="flex items-center justify-between rounded-xl border border-maia-navy-700 bg-maia-navy-900 px-4 py-2.5"
            >
              <span className="text-sm text-maia-ink-80">
                {m.name || 'Member'}
              </span>
              <span className="rounded-md border border-maia-navy-700 px-2 py-0.5 text-xs text-maia-ink-40">
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
