'use client';

/**
 * GENERIC CONNECTOR CARD
 *
 * Renders a connector based on its ConnectorDefinition.
 * Handles status display, capability tags, and action buttons.
 * For 'local' class connectors, renders inline config form.
 * For 'oauth' class, delegates to provider-specific components.
 */

import { useState } from 'react';
import {
  CheckCircle, AlertCircle, Loader2, Settings, XCircle,
  Mail, Calendar, BookOpen, Send, Globe, FileText,
} from 'lucide-react';
import type { ConnectorDefinition, ConnectorStatus, ConnectorCapability } from '@/lib/connectors/types';

// Map icon names to components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  Calendar,
  BookOpen,
  Send,
  Globe,
  FileText,
  Settings,
};

// Human-readable capability labels
const CAPABILITY_LABELS: Record<ConnectorCapability, string> = {
  send_email: 'Send emails',
  read_email: 'Read emails',
  create_calendar_event: 'Create events',
  read_calendar: 'Read calendar',
  read_contacts: 'Read contacts',
  export_markdown: 'Export markdown',
  export_transcript: 'Export transcripts',
  send_webhook: 'Send webhooks',
};

interface ConnectorCardProps {
  definition: ConnectorDefinition;
  status: ConnectorStatus;
  metadata?: Record<string, unknown>;
  lastUsedAt?: string | null;
  onConfigure?: () => void;
  onDisconnect?: () => void;
  children?: React.ReactNode; // For provider-specific config UI
}

export function ConnectorCard({
  definition,
  status,
  metadata,
  lastUsedAt,
  onConfigure,
  onDisconnect,
  children,
}: ConnectorCardProps) {
  const IconComponent = ICON_MAP[definition.icon] ?? Settings;
  const isConnected = status === 'connected';

  return (
    <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
            <IconComponent className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-stone-200">{definition.name}</h4>
            <p className="text-xs text-stone-500">{definition.description}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Capabilities */}
      {isConnected && (
        <div className="flex flex-wrap gap-2">
          {definition.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-2 py-0.5 bg-amber-600/10 text-amber-300/70 rounded-full"
            >
              {CAPABILITY_LABELS[cap] ?? cap}
            </span>
          ))}
        </div>
      )}

      {/* Last activity */}
      {isConnected && lastUsedAt && (
        <p className="text-[10px] text-stone-600">
          Last used: {new Date(lastUsedAt).toLocaleDateString()}
        </p>
      )}

      {/* Provider-specific content */}
      {children}

      {/* Actions */}
      {isConnected && onDisconnect && (
        <button
          onClick={onDisconnect}
          className="w-full px-3 py-2 text-sm text-stone-400 bg-stone-800/50
                     hover:bg-stone-700/50 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      )}

      {!isConnected && !children && onConfigure && (
        <button
          onClick={onConfigure}
          className="w-full px-3 py-2 text-sm text-amber-100 bg-amber-600/30
                     hover:bg-amber-600/50 rounded-lg transition-colors"
        >
          Configure
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ConnectorStatus }) {
  switch (status) {
    case 'connected':
      return (
        <span className="flex items-center gap-1 text-xs text-emerald-400">
          <CheckCircle className="w-3 h-3" /> Connected
        </span>
      );
    case 'configuring':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Configuring
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <XCircle className="w-3 h-3" /> Error
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-xs text-stone-500">
          <AlertCircle className="w-3 h-3" /> Not connected
        </span>
      );
  }
}

export default ConnectorCard;
