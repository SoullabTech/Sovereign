'use client';

/**
 * Spiralogic Evolutionary Report Page
 *
 * Flow:
 * 1. Check localStorage for beta_user session
 * 2. Fetch GET /api/astrology/spiralogic-report — existing report?
 * 3. Fetch GET /api/members/profile — birth data present?
 * 4. Render:
 *    - No birth data → BirthDataForm + generate button
 *    - Birth data but no report → "Generate Your Report" button
 *    - Report exists → SpiralogicEvolutionaryReport
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/http/apiBase';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';
import { SpiralogicEvolutionaryReport } from '@/components/astrology/SpiralogicEvolutionaryReport';
import type { SpiralogicEvolutionaryReportData } from '@/lib/astrology/spiralogicReportTypes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BirthDataResult {
  date: string;
  time: string;
  location: { name: string; lat: number; lng: number; timezone: string };
}

interface LocalUser {
  id?: string;
  name?: string;
  preferredName?: string;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SpiralogicReportPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [memberName, setMemberName] = useState('Explorer');
  const [report, setReport] = useState<SpiralogicEvolutionaryReportData | null>(null);
  const [savedBirthData, setSavedBirthData] = useState<BirthDataResult | null>(null);
  const [hasBirthData, setHasBirthData] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // ---------------------------------------------------------------------------
  // Load session + existing data
  // ---------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check local session
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('beta_user') : null;
      if (!raw) {
        router.push('/signin');
        return;
      }
      const user = JSON.parse(raw) as LocalUser;
      setMemberName(user.preferredName || user.name || 'Explorer');
    } catch {
      router.push('/signin');
      return;
    }

    // Fetch existing report (may 404 if none yet)
    try {
      const reportRes = await apiFetch('/api/astrology/spiralogic-report', { method: 'GET' });
      if (reportRes.ok) {
        const data = await reportRes.json();
        if (data.report) {
          setReport(data.report as SpiralogicEvolutionaryReportData);
          setLoading(false);
          return; // Report exists — show it immediately
        }
      }
    } catch {
      // Non-fatal — continue to check birth data
    }

    // Fetch profile for birth data
    try {
      const profileRes = await apiFetch('/api/members/profile', { method: 'GET' });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        // Profile API returns birth data nested under `birthData` (see
        // app/api/members/profile GET), not as flat birth_* columns
        if (profile.birthData?.date) {
          setHasBirthData(true);
          setSavedBirthData({
            date: profile.birthData.date,
            time: profile.birthData.time || '12:00',
            location: {
              name: profile.birthData.location?.name || '',
              lat: profile.birthData.location?.lat ?? 0,
              lng: profile.birthData.location?.lng ?? 0,
              timezone: profile.birthData.location?.timezone || 'UTC',
            },
          });
        }
      }
    } catch {
      // Non-fatal
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------------------------------------------------------
  // Generate report
  // ---------------------------------------------------------------------------

  const handleGenerate = useCallback(async (birthData?: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
  }) => {
    const bd = birthData ?? savedBirthData;
    if (!bd) {
      setShowForm(true);
      return;
    }

    setGenerating(true);
    setError(null);

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 90_000);

    try {
      const res = await apiFetch('/api/astrology/spiralogic-report', {
        method: 'POST',
        signal: abort.signal,
        body: JSON.stringify({
          birthDate: bd.date,
          birthTime: bd.time,
          lat: bd.location.lat,
          lng: bd.location.lng,
          locationName: bd.location.name,
          timezone: bd.location.timezone,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string; error?: string }).detail || (err as { error?: string }).error || 'Generation failed');
      }

      const data = await res.json();
      clearTimeout(timeout);
      setReport(data.report as SpiralogicEvolutionaryReportData);
      setShowForm(false);
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Report generation timed out. Please try again — this can happen during peak load.');
      } else {
        setError(err instanceof Error ? err.message : 'Report generation failed. Please try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [savedBirthData]);

  // Form submission handler — bridges BirthDataForm output to generateReport
  const handleFormSubmit = useCallback((data: {
    date: string;
    time: string;
    location: { name: string; lat: number; lng: number; timezone: string };
  }) => {
    setSavedBirthData(data);
    handleGenerate(data);
  }, [handleGenerate]);

  const handleRegenerate = useCallback(() => {
    if (savedBirthData) {
      handleGenerate(savedBirthData);
    } else {
      setShowForm(true);
      setReport(null);
    }
  }, [savedBirthData, handleGenerate]);

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0705' }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm font-serif italic"
          style={{ color: '#D88A2D', fontWeight: 300 }}
        >
          Reading the stars...
        </motion.div>
      </div>
    );
  }

  // Report exists — render it
  if (report && !showForm) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0A0705' }}>
        <SpiralogicEvolutionaryReport
          report={report}
          memberName={memberName}
          onRegenerate={handleRegenerate}
        />
        {generating && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-center"
            >
              <p className="text-sm font-serif italic mb-2" style={{ color: '#D88A2D' }}>
                Regenerating your report...
              </p>
              <p className="text-xs" style={{ color: '#9B6B3C' }}>This may take 30–60 seconds</p>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // Show birth data form
  if (showForm || !hasBirthData) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#0A0705' }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: '#9B6B3C', fontWeight: 300 }}>
              Spiralogic Evolutionary Report
            </p>
            <h1 className="text-2xl font-serif mb-2" style={{ color: '#D88A2D', fontWeight: 300 }}>
              {memberName}
            </h1>
            <p className="text-sm italic" style={{ color: '#E7E2CF', fontWeight: 300 }}>
              Enter your birth data to generate your personalised evolutionary map
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 border text-sm" style={{ borderColor: '#ef444440', color: '#fca5a5', fontWeight: 300 }}>
              {error}
            </div>
          )}

          <BirthDataForm
            onSubmit={handleFormSubmit}
            loading={generating}
          />

          {generating && (
            <div className="mt-6 text-center">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm font-serif italic"
                style={{ color: '#D88A2D', fontWeight: 300 }}
              >
                Calculating your Spiralogic map... this may take up to 60 seconds
              </motion.p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Birth data exists but no report yet
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0A0705' }}>
      <div className="max-w-lg text-center">
        <p className="text-xs tracking-widest uppercase mb-3" style={{ color: '#9B6B3C', fontWeight: 300 }}>
          Spiralogic Evolutionary Report
        </p>
        <h1 className="text-2xl font-serif mb-3" style={{ color: '#D88A2D', fontWeight: 300 }}>
          Ready to map your evolutionary path, {memberName}?
        </h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#E7E2CF', fontWeight: 300 }}>
          Your birth data is on file. MAIA will now generate a full Spiralogic Evolutionary Report —
          mapping your natal chart across all 12 facets of the framework.
        </p>

        {savedBirthData && (
          <p className="text-xs mb-6 italic" style={{ color: '#9B6B3C', fontWeight: 300 }}>
            Using: {savedBirthData.date} · {savedBirthData.location.name}
          </p>
        )}

        {error && (
          <div className="mb-6 p-4 border text-sm" style={{ borderColor: '#ef444440', color: '#fca5a5', fontWeight: 300 }}>
            {error}
          </div>
        )}

        <motion.button
          whileHover={{ scale: generating ? 1 : 1.02 }}
          whileTap={{ scale: generating ? 1 : 0.98 }}
          disabled={generating}
          onClick={() => handleGenerate()}
          className="px-8 py-4 font-serif text-lg border transition-all"
          style={{
            borderColor: generating ? '#9B6B3C60' : '#D88A2D',
            color: generating ? '#9B6B3C' : '#fed7aa',
            backgroundColor: generating ? 'transparent' : 'rgba(216,138,45,0.1)',
            cursor: generating ? 'not-allowed' : 'pointer',
          }}
        >
          {generating ? (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              Generating your report...
            </motion.span>
          ) : (
            'Generate My Spiralogic Report'
          )}
        </motion.button>

        {generating && (
          <p className="text-xs mt-4 italic" style={{ color: '#9B6B3C', fontWeight: 300 }}>
            This may take 30–60 seconds while MAIA reads your full chart
          </p>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="block mx-auto mt-4 text-xs"
          style={{ color: '#9B6B3C', fontWeight: 300 }}
        >
          Use different birth data
        </button>
      </div>
    </div>
  );
}
