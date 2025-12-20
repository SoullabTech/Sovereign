'use client';

/**
 * Three-Node Consciousness Architecture Dashboard
 *
 * Visualizes the activity of MAIA's three consciousness nodes:
 * - Sacred Mirror (Dialogue)
 * - Consultation (Consult)
 * - Supervisor (Scribe)
 *
 * This component displays real-time node activity during conversations
 * for debugging and transparency purposes.
 */

import React from 'react';
import type { ThreeNodeMetadata } from '@/lib/types/three-node-architecture';

interface ThreeNodeDashboardProps {
  metadata: ThreeNodeMetadata;
  compact?: boolean;
}

export function ThreeNodeDashboard({ metadata, compact = false }: ThreeNodeDashboardProps) {
  if (compact) {
    return <ThreeNodeCompactView metadata={metadata} />;
  }

  // Get mode-specific styling and info
  const modeInfo = getModeDisplayInfo(metadata.mode);

  return (
    <div className="three-node-dashboard rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Three-Node Architecture
          </h3>
          {metadata.mode && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${modeInfo.badgeClass}`}>
              {modeInfo.icon} {modeInfo.displayName}
            </span>
          )}
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {metadata.processingPath} Path
        </span>
      </div>

      {/* Mode Description */}
      {metadata.mode && (
        <div className="text-xs text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium">{modeInfo.displayName} Mode:</span> {modeInfo.description}
        </div>
      )}

      <div className="space-y-3">
        {/* Sacred Mirror Node */}
        <NodeCard
          name="Sacred Mirror"
          subtitle="Dialogue"
          icon="🌊"
          active={metadata.sacredMirror.active}
          timeMs={metadata.sacredMirror.timeMs}
          emphasis={modeInfo.emphasis.sacredMirror as 'HIGH' | 'MEDIUM' | 'LOW'}
          details={[
            { label: 'Style', value: metadata.sacredMirror.style },
            { label: 'Depth', value: metadata.sacredMirror.depth },
            { label: 'Rhythm', value: metadata.sacredMirror.rhythm },
            { label: 'Entry Point', value: metadata.sacredMirror.entryPoint },
          ]}
        />

        {/* Consultation Node */}
        <NodeCard
          name="Consultation"
          subtitle="Consult"
          icon="🧠"
          active={!!metadata.consultation?.active}
          timeMs={metadata.consultation?.timeMs || 0}
          emphasis={modeInfo.emphasis.consultation as 'HIGH' | 'MEDIUM' | 'LOW'}
          details={
            metadata.consultation
              ? [
                  { label: 'Type', value: metadata.consultation.type },
                  {
                    label: 'Confidence',
                    value: `${(metadata.consultation.confidenceScore * 100).toFixed(0)}%`,
                  },
                  { label: 'Issues', value: metadata.consultation.issuesDetected.toString() },
                  {
                    label: 'Sovereignty',
                    value: metadata.consultation.sovereigntyPreserved ? '✓' : '✗',
                  },
                ]
              : []
          }
          guidance={metadata.consultation?.guidance}
        />

        {/* Supervisor Node */}
        <NodeCard
          name="Supervisor"
          subtitle="Scribe"
          icon="🛡️"
          active={metadata.supervisor.active}
          timeMs={metadata.supervisor.timeMs}
          emphasis={modeInfo.emphasis.supervisor as 'HIGH' | 'MEDIUM' | 'LOW'}
          details={[
            { label: 'Decision', value: metadata.supervisor.decision },
            { label: 'Gold', value: metadata.supervisor.isGold ? '✓' : '✗' },
            { label: 'Feedback', value: metadata.supervisor.feedbackCount.toString() },
            { label: 'Regenerated', value: metadata.supervisor.regenerated ? '✓' : '✗' },
          ]}
          feedbackItems={metadata.supervisor.feedbackItems}
          learningOpportunity={metadata.supervisor.learningOpportunity}
        />
      </div>

      {/* Total Processing Time */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Processing Time</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {metadata.totalProcessingTimeMs}ms
          </span>
        </div>
      </div>
    </div>
  );
}

interface NodeCardProps {
  name: string;
  subtitle: string;
  icon: string;
  active: boolean;
  timeMs: number;
  details: { label: string; value: string }[];
  emphasis?: 'HIGH' | 'MEDIUM' | 'LOW'; // Mode-specific emphasis level
  guidance?: string;
  feedbackItems?: Array<{
    layer: string;
    severity: string;
    educationalNote: string;
  }>;
  learningOpportunity?: string;
}

function NodeCard({
  name,
  subtitle,
  icon,
  active,
  timeMs,
  details,
  emphasis,
  guidance,
  feedbackItems,
  learningOpportunity,
}: NodeCardProps) {
  return (
    <div
      className={`node-card rounded border p-3 transition-all ${
        active
          ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{timeMs}ms</div>
          <div className="flex items-center gap-1">
            <div
              className={`text-xs ${active ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}
            >
              {active ? 'Active' : 'Inactive'}
            </div>
            {emphasis && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  emphasis === 'HIGH'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : emphasis === 'MEDIUM'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {emphasis}
              </span>
            )}
          </div>
        </div>
      </div>

      {active && details.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {details.map((detail, idx) => (
            <div key={idx} className="text-xs">
              <span className="text-gray-500 dark:text-gray-400">{detail.label}:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-gray-100">{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {guidance && (
        <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Guidance:</span> {guidance}
        </div>
      )}

      {feedbackItems && feedbackItems.length > 0 && (
        <div className="mt-2 space-y-1">
          {feedbackItems.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className={`p-2 rounded text-xs ${
                item.severity === 'CRITICAL'
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : item.severity === 'VIOLATION'
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="font-semibold">{item.layer}</div>
              <div className="mt-1">{item.educationalNote}</div>
            </div>
          ))}
        </div>
      )}

      {learningOpportunity && (
        <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs text-gray-700 dark:text-gray-300">
          <span className="font-semibold">Learning:</span> {learningOpportunity}
        </div>
      )}
    </div>
  );
}

/**
 * Compact view for embedding in chat interface
 */
function ThreeNodeCompactView({ metadata }: { metadata: ThreeNodeMetadata }) {
  const consultationActive = !!metadata.consultation?.active;

  return (
    <div className="three-node-compact flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span className="font-medium">{metadata.processingPath}</span>
      <div className="flex items-center gap-1">
        <NodeIndicator icon="🌊" active={metadata.sacredMirror.active} label="Mirror" />
        <NodeIndicator icon="🧠" active={consultationActive} label="Consult" />
        <NodeIndicator
          icon="🛡️"
          active={metadata.supervisor.active}
          label="Supervisor"
          isGold={metadata.supervisor.isGold}
        />
      </div>
      <span className="text-gray-400">•</span>
      <span>{metadata.totalProcessingTimeMs}ms</span>
    </div>
  );
}

function NodeIndicator({
  icon,
  active,
  label,
  isGold,
}: {
  icon: string;
  active: boolean;
  label: string;
  isGold?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded ${
        active
          ? isGold
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
      }`}
      title={label}
    >
      <span>{icon}</span>
    </div>
  );
}

/**
 * Get mode-specific display information
 */
function getModeDisplayInfo(mode?: 'dialogue' | 'counsel' | 'scribe') {
  switch (mode) {
    case 'dialogue':
      return {
        displayName: 'Talk',
        icon: '💬',
        badgeClass: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        emphasis: {
          sacredMirror: 'HIGH',
          consultation: 'LOW',
          supervisor: 'MEDIUM',
        },
        description: 'Quick conversational presence',
      };
    case 'counsel':
      return {
        displayName: 'Care',
        icon: '🌿',
        badgeClass: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        emphasis: {
          sacredMirror: 'HIGH',
          consultation: 'HIGH',
          supervisor: 'HIGH',
        },
        description: 'Deep therapeutic holding',
      };
    case 'scribe':
      return {
        displayName: 'Note',
        icon: '📝',
        badgeClass: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
        emphasis: {
          sacredMirror: 'MEDIUM',
          consultation: 'MEDIUM',
          supervisor: 'HIGH',
        },
        description: 'Witnessing and pattern recognition',
      };
    default:
      return {
        displayName: 'Default',
        icon: '⚙️',
        badgeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        emphasis: {
          sacredMirror: 'MEDIUM',
          consultation: 'MEDIUM',
          supervisor: 'MEDIUM',
        },
        description: 'Standard processing',
      };
  }
}

/**
 * Example usage in chat interface:
 *
 * import { ThreeNodeDashboard } from '@/components/debug/ThreeNodeDashboard';
 *
 * // In your chat component:
 * {response.threeNodeMetadata && (
 *   <ThreeNodeDashboard metadata={response.threeNodeMetadata} compact />
 * )}
 */
