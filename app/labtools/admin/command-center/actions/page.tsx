'use client';

import React, { useState } from 'react';
import { adminFetch } from '@/lib/admin/adminFetch';
import { motion } from 'framer-motion';
import {
  Shield,
  Zap,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
interface ActionResult {
  action: string;
  timestamp: string;
  results: {
    passed: boolean;
    checks: Array<{ name: string; status: 'pass' | 'fail' | 'warn'; detail: string }>;
  };
}

// ─── Check Row ──────────────────────────────────────────────────────
function CheckRow({ check }: { check: { name: string; status: 'pass' | 'fail' | 'warn'; detail: string } }) {
  const statusIcons: Record<string, { Icon: any; color: string }> = {
    pass: { Icon: CheckCircle, color: 'text-green-400' },
    fail: { Icon: XCircle, color: 'text-red-400' },
    warn: { Icon: AlertTriangle, color: 'text-amber-400' },
  };
  const { Icon, color } = statusIcons[check.status] || statusIcons.pass;

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-300">{check.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
      </div>
    </div>
  );
}

// ─── Result Badge ───────────────────────────────────────────────────
function ResultBadge({ passed, hasWarnings }: { passed: boolean; hasWarnings: boolean }) {
  if (!passed) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
        <XCircle className="w-5 h-5 text-red-400" />
        <span className="text-sm font-bold text-red-400">FAILED</span>
      </div>
    );
  }
  if (hasWarnings) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-bold text-amber-400">WARNINGS</span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30">
      <CheckCircle className="w-5 h-5 text-green-400" />
      <span className="text-sm font-bold text-green-400">PASSED</span>
    </div>
  );
}

// ─── Action Card ────────────────────────────────────────────────────
function ActionCard({
  title,
  description,
  icon: Icon,
  actionName,
  running,
  result,
  onRun,
}: {
  title: string;
  description: string;
  icon: any;
  actionName: string;
  running: string | null;
  result: ActionResult | null;
  onRun: (action: string) => void;
}) {
  const isRunning = running === actionName;
  const hasResult = result && result.action === actionName;

  const hasWarnings = hasResult
    ? result.results.checks.some((c) => c.status === 'warn')
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-xl border border-zinc-800 p-5"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-500/10 rounded-lg">
          <Icon className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      <button
        onClick={() => onRun(actionName)}
        disabled={running !== null}
        className="mt-4 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-black font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {isRunning && (
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        )}
        <span>{isRunning ? 'Running...' : 'Run'}</span>
      </button>

      {hasResult && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <ResultBadge passed={result.results.passed} hasWarnings={hasWarnings} />
            <span className="text-xs text-gray-500">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            {result.results.checks.map((check, i) => (
              <CheckRow key={i} check={check} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ActionsPage() {
  const [results, setResults] = useState<ActionResult | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (action: string) => {
    try {
      setRunning(action);
      setError(null);
      const res = await adminFetch('/api/admin/command-center/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResults(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run action');
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Actions & Testing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Run diagnostic tests and system verifications
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6">
        <ActionCard
          title="Smoke Test"
          description="Verify database table accessibility and basic connectivity"
          icon={Shield}
          actionName="smoke_test"
          running={running}
          result={results}
          onRun={runAction}
        />

        <ActionCard
          title="Field Engine Verify"
          description="Test field orchestrator with dummy input and validate response"
          icon={Zap}
          actionName="field_verify"
          running={running}
          result={results}
          onRun={runAction}
        />

        <ActionCard
          title="Health Check"
          description="Check database connectivity, recent activity, and error rates"
          icon={HeartPulse}
          actionName="health_check"
          running={running}
          result={results}
          onRun={runAction}
        />
      </div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4"
      >
        <p className="text-xs text-gray-500">
          These actions run diagnostic tests on the MAIA platform. Smoke tests verify database
          tables, field engine verification tests the orchestrator, and health checks assess
          system vitality. Results are displayed below each action after execution.
        </p>
      </motion.div>
    </div>
  );
}
