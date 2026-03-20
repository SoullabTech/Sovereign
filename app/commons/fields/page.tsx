'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { WisdomFieldCard } from '@/components/wisdom-fields/WisdomFieldCard';

interface FieldSummary {
  id: string;
  slug: string;
  fieldType: 'wisdom_keeper' | 'masters_field';
  aiPosture: 'contextual' | 'none';
  masterName: string;
  masterDates?: string | null;
  masterDomain?: string | null;
  orientation?: string | null;
  memberCount: number;
}

export default function FieldsIndexPage() {
  const [fields, setFields] = useState<FieldSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/wisdom-fields')
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setFields(data.fields ?? []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const wisdomKeepers = fields.filter((f) => f.fieldType === 'wisdom_keeper');
  const mastersFields = fields.filter((f) => f.fieldType === 'masters_field');

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-80">
      <div className="mx-auto max-w-2xl px-5 py-12 space-y-12">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-semibold text-maia-ink-100">Fields</h1>
          <p className="mt-3 text-base text-maia-ink-60 leading-relaxed">
            Each field is a gathering space around a body of work — for study, reflection, and living integration.
            Not a library. Not a forum. A place where serious thought is metabolized collectively.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-maia-navy-700 border-t-maia-ink-60" />
          </div>
        ) : (
          <>
            {/* Wisdom Keepers */}
            {wisdomKeepers.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xs tracking-widest uppercase text-maia-ink-40">Wisdom Keepers</h2>
                  <p className="mt-1 text-sm text-maia-ink-40">
                    Thinkers whose work has entered the shared cultural inheritance.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {wisdomKeepers.map((f, i) => (
                    <WisdomFieldCard key={f.id} {...f} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Master's Fields */}
            {mastersFields.length > 0 && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-xs tracking-widest uppercase text-maia-ink-40">Master's Fields</h2>
                  <p className="mt-1 text-sm text-maia-ink-40">
                    Living thinkers whose work deserves a gathering space. MAIA is quiet here.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {mastersFields.map((f, i) => (
                    <WisdomFieldCard key={f.id} {...f} index={i} />
                  ))}
                </div>
              </section>
            )}

            {fields.length === 0 && (
              <p className="text-center text-sm text-maia-ink-40 py-12">No fields yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
