'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Heart, Clock, MessageSquare } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import type { RelationshipRecord } from '@/lib/studio/relationships/types';
import { ROLE_LABELS } from '@/lib/studio/relationships/types';

export default function RelationshipsPage() {
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelationships();
  }, []);

  async function loadRelationships() {
    setLoading(true);
    try {
      const res = await apiFetch('/api/studio/relationships');
      if (res.ok) {
        const data = await res.json();
        setRelationships(data.relationships || []);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-light text-white flex items-center gap-3">
              <Heart className="w-6 h-6 text-amber-400" />
              Relationships
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track and reflect on your significant relationships
            </p>
          </div>
          <Link
            href="/studio/relationships/new"
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Person
          </Link>
        </div>

        {/* Relationship List */}
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading...</div>
        ) : relationships.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No relationships yet</p>
            <p className="text-sm text-slate-500 mb-6">
              Add someone you want to track your connection with.
            </p>
            <Link
              href="/studio/relationships/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add First Person
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {relationships.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/studio/relationships/${r.id}`}>
                  <div className="p-4 rounded-lg border border-slate-800/60 bg-slate-900/50 hover:border-amber-800/40 transition-colors group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">
                          {r.personName}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {ROLE_LABELS[r.role]}
                          {r.ageYears ? ` \u00B7 ${r.ageYears} years old` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {r.checkinCount} check-in{r.checkinCount !== 1 ? 's' : ''}
                      </span>
                      {r.lastCheckinAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.lastCheckinAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
