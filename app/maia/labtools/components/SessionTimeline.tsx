'use client';

import { useState, useEffect } from 'react';
import { LabToolsService } from '../lib/LabToolsService';

interface SessionTimelineProps {
  service: LabToolsService;
}

export function SessionTimeline({ service }: SessionTimelineProps) {
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);

  useEffect(() => {
    const handleProtocolStarted = (protocol: any) => {
      const event: SessionEvent = {
        id: Date.now().toString(),
        type: 'protocol_start',
        message: `Started ${protocol.name}`,
        timestamp: Date.now(),
        severity: 'info'
      };
      setSessionEvents(prev => [event, ...prev].slice(0, 10));
    };

    const handleProtocolStopped = () => {
      const event: SessionEvent = {
        id: Date.now().toString(),
        type: 'protocol_stop',
        message: 'Session ended',
        timestamp: Date.now(),
        severity: 'info'
      };
      setSessionEvents(prev => [event, ...prev].slice(0, 10));
    };

    const handleGuardianAlert = (alert: any) => {
      const event: SessionEvent = {
        id: Date.now().toString(),
        type: 'guardian_alert',
        message: alert.message,
        timestamp: Date.now(),
        severity: alert.type
      };
      setSessionEvents(prev => [event, ...prev].slice(0, 10));
    };

    service.on('protocolStarted', handleProtocolStarted);
    service.on('protocolStopped', handleProtocolStopped);
    service.on('guardianUpdate', (state) => {
      if (state.alerts.length > 0) {
        handleGuardianAlert(state.alerts[0]);
      }
    });

    return () => {
      service.off('protocolStarted', handleProtocolStarted);
      service.off('protocolStopped', handleProtocolStopped);
    };
  }, [service]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">⏱️ Session Timeline</h2>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sessionEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No session events yet
          </div>
        ) : (
          sessionEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

interface SessionEvent {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
}

interface EventCardProps {
  event: SessionEvent;
}

function EventCard({ event }: EventCardProps) {
  const getEventColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'border-blue-500/50 text-blue-300';
      case 'warning': return 'border-yellow-500/50 text-yellow-300';
      case 'critical': return 'border-red-500/50 text-red-300';
      default: return 'border-gray-500/50 text-gray-300';
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <div className={`border-l-4 pl-3 py-2 ${getEventColor(event.severity)}`}>
      <div className="flex justify-between items-start">
        <div className="text-sm">{event.message}</div>
        <div className="text-xs opacity-75">{timeAgo(event.timestamp)}</div>
      </div>
    </div>
  );
}