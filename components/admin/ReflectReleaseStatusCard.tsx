'use client';

/**
 * Source-only candidate for the existing Soullab Admin Cockpit.
 * Read-only, nonsecret runtime observation. No privileged action UI.
 * A password-only admin session cannot satisfy the founder-session endpoint.
 */
import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { fetchReflectAdminStatus } from '@/lib/proStudio/reflectAdminRuntimeStatus';

type ReflectMode = 'OFF' | 'CONFIGURED_UNVERIFIED' | 'HOLD_CONFIG_DRIFT';

type ReflectObservation = {
  mode: ReflectMode;
  oneAccountConfiguration: 'ABSENT' | 'SINGLE_FORMAT_VALID' | 'NOT_VERIFIED';
  observationScope: 'RESPONDING_READER_PROCESS_ONLY';
  operatorAuthority: 'NOT_QUALIFIED';
  emergencyContainment: 'NOT_LIVE_VERIFIED';
  admissionAndRevocation: 'NOT_WITNESSED';
};

type SafeObservation = {
  observation: ReflectObservation;
  observedAt: string;
};

type FetchState = 'loading' | 'available' | 'founder-required' | 'unavailable';

const LABELS: Record<ReflectMode, string> = {
  OFF: 'OFF on the responding reader',
  CONFIGURED_UNVERIFIED: 'Configured — admission not verified',
  HOLD_CONFIG_DRIFT: 'HOLD — configuration mismatch',
};

export default function ReflectReleaseStatusCard() {
  const [state, setState] = useState<FetchState>('loading');
  const [snapshot, setSnapshot] = useState<SafeObservation | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Only a verified founder *member session* qualifies. Do not forward
      // the shared admin password for this extra-sensitive read-only endpoint.
      let sessionToken: string | null = null;
      try {
        sessionToken = window.localStorage.getItem('maia_session_token');
      } catch {
        // Cookie authentication can still work when storage is disabled.
      }
      const res = await fetchReflectAdminStatus(fetch, sessionToken);
      if (res.status === 401 || res.status === 403) {
        setState('founder-required');
        setSnapshot(null);
        return;
      }
      if (!res.ok) throw new Error('Observation unavailable');
      const data: SafeObservation = await res.json();
      if (!data?.observation ||
          !['OFF', 'CONFIGURED_UNVERIFIED', 'HOLD_CONFIG_DRIFT'].includes(data.observation.mode) ||
          data.observation.observationScope !== 'RESPONDING_READER_PROCESS_ONLY' ||
          data.observation.operatorAuthority !== 'NOT_QUALIFIED' ||
          data.observation.emergencyContainment !== 'NOT_LIVE_VERIFIED' ||
          data.observation.admissionAndRevocation !== 'NOT_WITNESSED' ||
          typeof data.observedAt !== 'string') {
        throw new Error('Unexpected observation');
      }
      setSnapshot(data);
      setState('available');
    } catch {
      setSnapshot(null);
      setState('unavailable');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const observation = state === 'available' ? snapshot?.observation : null;
  const title = observation ? LABELS[observation.mode] :
    state === 'founder-required' ? 'Verified founder session required' :
    state === 'loading' ? 'Checking reader status…' : 'Status unavailable — do not assume OFF';

  return (
    <section
      aria-label="Reflect founder release status — read only"
      className="bg-slate-900/80 border border-[#D4B896]/30 rounded-xl p-5 mb-4 text-[#D4B896]"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Reflect E010 · Release status</h2>
            <p className="text-xs text-[#D4B896]/60">
              Read-only observation; this is not an activation control.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="flex items-center gap-2 rounded-md border border-[#D4B896]/30 px-3 py-1.5 text-xs hover:bg-[#D4B896]/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh status
        </button>
      </div>
      <p className="mt-4 text-base font-medium" role="status" aria-live="polite">{title}</p>
      {state === 'founder-required' && (
        <p className="text-sm mt-2 text-amber-300">
          The shared Admin Cockpit password does not authorize this status endpoint.
          Sign in to Soullab with your verified founder member account first.
          Do not share any password or member ID here.
        </p>
      )}
      {observation && (
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-[#D4B896]/70">
          <p>Account configuration: {observation.oneAccountConfiguration === 'ABSENT'
            ? 'Absent' : observation.oneAccountConfiguration === 'SINGLE_FORMAT_VALID'
              ? 'One ID format (identity unverified)' : 'Not verified'}</p>
          <p>Production operator: Not qualified</p>
          <p>Emergency shutoff: Not live-verified</p>
          <p>Admission / revocation: Not witnessed</p>
        </div>
      )}
      {state === 'available' && snapshot && (
        <p className="mt-3 text-xs text-[#D4B896]/50">
          Observed {new Date(snapshot.observedAt).toLocaleString()} on this responding
          MAIA process only. Not an independent image, disk or cluster attestation.
        </p>
      )}
      <p className="mt-3 text-xs text-[#D4B896]/60">
        Release remains on HOLD until the permitted production-control and
        emergency-shutoff gates are qualified. No ON/OFF actions are available here.
        {' '}<a
          href="https://github.com/SoullabTech/Sovereign/issues/1816"
          target="_blank" rel="noopener noreferrer"
          className="underline hover:text-[#D4B896]"
        >Release record #1816</a>
      </p>
    </section>
  );
}
