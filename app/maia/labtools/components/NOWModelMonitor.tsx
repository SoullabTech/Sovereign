// @ts-nocheck
/**
 * NOWModelMonitor - Real-time Nested Observer Windows Model Compliance Monitor
 *
 * Displays real-time metrics for Justin Riddle's NOW model three principles:
 * 1. Synchrony (zero phase lag, high correlation)
 * 2. Coherence (non-zero phase lag, communication between windows)
 * 3. Cross-frequency Coupling (weak coupling between temporal scales)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LabToolsService, NOWModelState } from '../lib/LabToolsService';

interface NOWModelMonitorProps {
  service: LabToolsService;
}

interface WindowMetrics {
  id: string;
  name: string;
  timeScale: string;
  frequency: number;
  synchrony: number;
  coherence: number;
  coupling: number;
  status: 'integrated' | 'communicating' | 'coupled' | 'disconnected';
}

export default function NOWModelMonitor({ service }: NOWModelMonitorProps) {
  const [nowState, setNowState] = useState<NOWModelState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Subscribe to NOW model updates
    const handleNOWUpdate = (state: NOWModelState) => {
      setNowState(state);
      drawWindowHierarchy(state);
    };

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    service.on('nowUpdate', handleNOWUpdate);
    service.on('connected', handleConnected);
    service.on('disconnected', handleDisconnected);

    return () => {
      service.off('nowUpdate', handleNOWUpdate);
      service.off('connected', handleConnected);
      service.off('disconnected', handleDisconnected);
    };
  }, [service]);

  const drawWindowHierarchy = (state: NOWModelState) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw nested observer windows as concentric circles
    const baseRadius = 30;

    state.windows.forEach((window, index) => {
      const radius = baseRadius + (index * 25);
      const alpha = Math.min(window.synchrony, 0.8) + 0.2;

      // Window boundary
      ctx.beginPath();
      ctx.strokeStyle = `rgba(147, 51, 234, ${alpha})`;
      ctx.lineWidth = 2 + (window.synchrony * 3);
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();

      // Coherence indicators (connection lines between windows)
      if (index > 0) {
        const prevRadius = baseRadius + ((index - 1) * 25);
        const coherenceStrength = window.coherence;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(34, 197, 94, ${coherenceStrength})`;
        ctx.lineWidth = 1 + (coherenceStrength * 2);
        ctx.moveTo(centerX + prevRadius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.stroke();
      }

      // Cross-frequency coupling indicators (phase relationships)
      if (window.coupling > 0.3) {
        const angle = (Date.now() / 1000) * window.frequency;
        const couplingX = centerX + Math.cos(angle) * radius * 0.8;
        const couplingY = centerY + Math.sin(angle) * radius * 0.8;

        ctx.beginPath();
        ctx.fillStyle = `rgba(249, 115, 22, ${window.coupling})`;
        ctx.arc(couplingX, couplingY, 3 + window.coupling * 2, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Window label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(window.name, centerX, centerY - radius - 10);
    });

    // Draw overall synchrony indicator at center
    if (state.overallSynchrony > 0.7) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(147, 51, 234, ${state.overallSynchrony})`;
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Pulse effect for high synchrony
      ctx.beginPath();
      ctx.strokeStyle = `rgba(147, 51, 234, ${state.overallSynchrony * 0.5})`;
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, 8 + Math.sin(Date.now() / 200) * 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'integrated': return 'border-purple-500 bg-purple-500/20';
      case 'communicating': return 'border-green-500 bg-green-500/20';
      case 'coupled': return 'border-orange-500 bg-orange-500/20';
      case 'disconnected': return 'border-red-500 bg-red-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getMetricColor = (value: number, threshold: number = 0.7) => {
    if (value >= threshold) return 'text-green-400';
    if (value >= threshold * 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!nowState) {
    return (
      <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
        <div className="text-center">
          <div className="text-purple-400 mb-2">⧖ NOW Model Monitor</div>
          <div className="text-gray-400 text-sm">Loading consciousness architecture...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 border border-purple-500/30 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-purple-400">⧖ NOW Model Monitor</h3>
          <p className="text-xs text-gray-400">Nested Observer Windows Compliance</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">SYNCHRONY</div>
          <div className={`text-2xl font-mono ${getMetricColor(nowState.overallSynchrony)}`}>
            {(nowState.overallSynchrony * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Zero-lag correlation</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">COHERENCE</div>
          <div className={`text-2xl font-mono ${getMetricColor(nowState.overallCoherence)}`}>
            {(nowState.overallCoherence * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Inter-window comm</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-400 mb-1">COUPLING</div>
          <div className={`text-2xl font-mono ${getMetricColor(nowState.overallCoupling, 0.4)}`}>
            {(nowState.overallCoupling * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">Cross-frequency</div>
        </div>
      </div>

      {/* Hierarchy Visualization */}
      <div className="mb-6">
        <canvas
          ref={canvasRef}
          width={300}
          height={200}
          className="w-full border border-purple-500/20 rounded bg-black/30"
        />
      </div>

      {/* Window Details */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400 mb-2">OBSERVER WINDOWS</div>
        {nowState.windows.map((window, index) => (
          <div
            key={window.id}
            className={`flex justify-between items-center p-2 rounded border ${getStatusColor(window.status)}`}
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{window.name}</div>
              <div className="text-xs text-gray-400">{window.timeScale} • {window.frequency.toFixed(1)}Hz</div>
            </div>
            <div className="flex gap-3 text-xs">
              <div className={`${getMetricColor(window.synchrony)}`}>
                S: {(window.synchrony * 100).toFixed(0)}%
              </div>
              <div className={`${getMetricColor(window.coherence)}`}>
                C: {(window.coherence * 100).toFixed(0)}%
              </div>
              <div className={`${getMetricColor(window.coupling, 0.4)}`}>
                X: {(window.coupling * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Status */}
      <div className="mt-4 pt-4 border-t border-purple-500/20">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400">Integration Quality:</span>
          <span className={`font-mono ${getMetricColor(nowState.integrationQuality)}`}>
            {(nowState.integrationQuality * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-black/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-300"
            style={{ width: `${nowState.integrationQuality * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}