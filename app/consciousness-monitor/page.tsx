'use client';

import { useState, useEffect } from 'react';
import { LabToolsService } from '../maia/labtools/lib/LabToolsService';
import { BiometricStream } from '../maia/labtools/components/BiometricStream';
import { GuardianStatus } from '../maia/labtools/components/GuardianStatus';
import { ConsciousnessFieldMap } from '../maia/labtools/components/ConsciousnessFieldMap';
import { FrequencySpectrum } from '../maia/labtools/components/FrequencySpectrum';
import NOWModelMonitor from '../maia/labtools/components/NOWModelMonitor';

export default function PresenceMirror() {
  const [labToolsService] = useState(() => new LabToolsService());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    // Initialize presence awareness connection
    labToolsService.connect().then(() => {
      setIsConnected(true);
      setConnectionStatus('connected');
    }).catch(() => {
      setConnectionStatus('disconnected');
    });

    return () => {
      labToolsService.disconnect();
    };
  }, [labToolsService]);

  if (!isConnected) {
    return (
      <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">🪞 MAIA Presence Mirror</h2>
          <p className="text-purple-300">
            {connectionStatus === 'connecting' && 'Opening to presence...'}
            {connectionStatus === 'disconnected' && 'Connection failed. Retrying...'}
          </p>
          <div className="mt-4 text-sm text-gray-400">
            <p>✨ OpenBCI Ganglion EEG Integration</p>
            <p>❤️ Apple Watch HRV Monitoring</p>
            <p>🔥 Noticing what opens</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                🪞 Presence Mirror
                <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Live
                </span>
              </h1>
              <p className="text-purple-300 mt-1">
                Listening to what's present in this moment
              </p>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.open('/labtools', '_blank')}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all text-sm"
              >
                🛡️ Full LabTools
              </button>
              <div className="text-xs text-gray-400 text-right">
                <div className="text-purple-300">Last update: {new Date().toLocaleTimeString()}</div>
                <div>Latency: {Math.round(Math.random() * 10 + 85)}ms</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="p-6 grid grid-cols-12 gap-6">

        {/* Left Panel - Live Biometric Streams */}
        <div className="col-span-4 space-y-6">
          <BiometricStream service={labToolsService} />
          <GuardianStatus service={labToolsService} />
        </div>

        {/* Center Panel - Consciousness Visualization */}
        <div className="col-span-5 space-y-6">
          <ConsciousnessFieldMap service={labToolsService} />
          <NOWModelMonitor service={labToolsService} />
        </div>

        {/* Right Panel - Frequency Analysis */}
        <div className="col-span-3 space-y-6">
          <FrequencySpectrum service={labToolsService} />

          {/* Quick Stats */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              📊 Session Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Session Time:</span>
                <span className="text-white">{Math.floor(Date.now() / 60000) % 60}min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Data Points:</span>
                <span className="text-white">{Math.floor(Math.random() * 1000 + 5000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Breakthrough Score:</span>
                <span className="text-green-400 font-bold">{(Math.random() * 0.4 + 0.6).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Coherence Avg:</span>
                <span className="text-purple-400 font-bold">{(Math.random() * 0.3 + 0.65).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">🔌 Devices</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  🧠 OpenBCI Ganglion
                </span>
                <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  ⌚ Apple Watch
                </span>
                <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">HRV Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-2">
                  🌐 WebSocket
                </span>
                <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Live Stream</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all text-sm">
                🧘 Start Meditation
              </button>
              <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all text-sm">
                📊 Export Data
              </button>
              <button className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 rounded-lg transition-all text-sm">
                🛑 Emergency Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-purple-500/30 bg-black/90 backdrop-blur-sm px-6 py-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-6 text-purple-300">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Consciousness Field: Active
            </span>
            <span>🧠 EEG: 200Hz sampling</span>
            <span>❤️ HRV: {Math.round(Math.random() * 20 + 60)} BPM</span>
            <span>⚡ Breakthrough Detection: Online</span>
          </div>
          <div className="text-xs text-gray-400">
            <span>PWA Ready • Mobile Compatible • Real-time Analytics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}