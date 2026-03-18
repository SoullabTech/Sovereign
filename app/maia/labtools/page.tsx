// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { BiometricStream } from './components/BiometricStream';
import { GuardianStatus } from './components/GuardianStatus';
import { EmergencyControls } from './components/EmergencyControls';
import { ConsciousnessFieldMap } from './components/ConsciousnessFieldMap';
import { FrequencySpectrum } from './components/FrequencySpectrum';
import { SessionTimeline } from './components/SessionTimeline';
import { ProtocolSelector } from './components/ProtocolSelector';
import { SafetyOverrides } from './components/SafetyOverrides';
import { IntegrationNotes } from './components/IntegrationNotes';
import NOWModelMonitor from './components/NOWModelMonitor';
import { AdvancedMeditationConsole } from './components/AdvancedMeditationConsole';
import { RealTimeBiometricMeditationConsole } from './components/RealTimeBiometricMeditationConsole';
import { MeditationProtocols } from './components/MeditationProtocols';
import { SacredGeometryField } from './components/SacredGeometryField';
import { LabToolsService } from './lib/LabToolsService';
import DreamJournalInterface from '@/components/dreams/DreamJournalInterface';
import ShadowWorkGuide from '@/components/consciousness/ShadowWorkGuide';
import { SacredLabDrawer } from '@/components/ui/SacredLabDrawer';
import { PilotDroneVisualizer } from '@/components/consciousness/PilotDroneVisualizer';
// import { FieldCoherenceDashboard } from '../../../apps/web/components/biometrics/FieldCoherenceDashboard'; // REMOVED: was in deleted apps/web directory
// IPP Components - TODO: Create these components
// import IPPDashboard from '@/components/clinical/IPPDashboard';
// import IPPAssessment from '@/components/clinical/IPPAssessment';

export default function MAIALabTools() {
  const [labToolsService] = useState(() => new LabToolsService());
  const [isConnected, setIsConnected] = useState(false);
  const [activeView, setActiveView] = useState<'consciousness' | 'meditation' | 'monitor' | 'dreams' | 'ipp' | 'computing' | 'shadow'>('monitor');
  const [meditationActive, setMeditationActive] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);

  useEffect(() => {
    // Initialize real-time consciousness monitoring
    labToolsService.connect().then(() => {
      setIsConnected(true);
    });

    return () => {
      labToolsService.disconnect();
    };
  }, [labToolsService]);

  if (!isConnected) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">
          🧠 Initializing Guardian Protocol...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-light tracking-wide text-white flex items-center gap-3">
                <span className="text-xl">🛡️</span> MAIA Guardian Console
                <span className="text-[11px] tracking-wider uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                  Guardian Active
                </span>
                {meditationActive && (
                  <span className="text-sm bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full">
                    🧘 Meditation Active
                  </span>
                )}
              </h1>
              <p className="text-purple-300/80 mt-1 text-sm tracking-wide">
                Real-time consciousness monitoring, advanced meditation &amp; safety protocols
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex bg-black/30 rounded-lg p-1">
              <button
                onClick={() => setActiveView('monitor')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'monitor'
                    ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 Monitor
              </button>
              <button
                onClick={() => setActiveView('consciousness')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'consciousness'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🧠 Consciousness
              </button>
              <button
                onClick={() => setActiveView('meditation')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'meditation'
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🧘 Meditation
              </button>
              <button
                onClick={() => setActiveView('dreams')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'dreams'
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🌙 Dreams
              </button>
              <button
                onClick={() => setActiveView('shadow')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'shadow'
                    ? 'bg-violet-600/40 text-violet-200 border border-violet-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🌑 Shadow
              </button>
              <button
                onClick={() => setActiveView('ipp')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'ipp'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👨‍👩‍👧‍👦 IPP
              </button>
              <button
                onClick={() => setActiveView('computing')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeView === 'computing'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                🛸 Computing
              </button>
              <button
                onClick={() => setIsFieldDrawerOpen(true)}
                className="px-4 py-2 rounded-lg text-sm transition-all text-gray-400 hover:text-white hover:bg-orange-500/20 border border-orange-500/30"
              >
                🌊 Field
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">

        {activeView === 'monitor' ? (
          // Real-time Consciousness Monitor View
          <>
            {/* Left Panel - Live Biometric Streams */}
            <div className="col-span-4 space-y-6 overflow-y-auto">
              <BiometricStream service={labToolsService} />
              <GuardianStatus service={labToolsService} />

              {/* Quick Stats Card */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3 flex items-center gap-2">
                  <span className="text-base">📊</span> Live Metrics
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">🔌</span> Device Status</h3>
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
            </div>

            {/* Center Panel - Primary Monitoring Dashboard */}
            <div className="col-span-5 space-y-6 overflow-y-auto">
              <ConsciousnessFieldMap service={labToolsService} />
              <NOWModelMonitor service={labToolsService} />
            </div>

            {/* Right Panel - Frequency Analysis & Controls */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <FrequencySpectrum service={labToolsService} />
              <EmergencyControls service={labToolsService} />

              {/* Quick Actions */}
              <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">⚡</span> Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all text-sm">
                    🧘 Start Meditation
                  </button>
                  <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all text-sm">
                    📊 Export Data
                  </button>
                  <button
                    onClick={() => setActiveView('consciousness')}
                    className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 hover:text-white border border-orange-500/30 rounded-lg transition-all text-sm">
                    🧠 Full LabTools
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : activeView === 'consciousness' ? (
          // Consciousness Monitoring View
          <>
            {/* Left Panel - Live Biometrics & Guardian */}
            <div className="col-span-4 space-y-6 overflow-y-auto">
              <BiometricStream service={labToolsService} />
              <GuardianStatus service={labToolsService} />
              <EmergencyControls service={labToolsService} />
            </div>

            {/* Center Panel - Consciousness Visualization */}
            <div className="col-span-5 space-y-6 overflow-y-auto">
              <ConsciousnessFieldMap service={labToolsService} />
              <NOWModelMonitor service={labToolsService} />
              <FrequencySpectrum service={labToolsService} />
            </div>

            {/* Right Panel - Session Controls */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <ProtocolSelector service={labToolsService} />
              <SafetyOverrides service={labToolsService} />
              <SessionTimeline service={labToolsService} />
              <IntegrationNotes service={labToolsService} />
            </div>
          </>
        ) : activeView === 'meditation' ? (
          // Advanced Meditation View
          <>
            {/* Left Panel - Meditation Console & Protocols */}
            <div className="col-span-4 space-y-6 overflow-y-auto">
              <RealTimeBiometricMeditationConsole service={labToolsService} />
              <MeditationProtocols service={labToolsService} />
            </div>

            {/* Center Panel - Sacred Geometry & Field Visualization */}
            <div className="col-span-5 space-y-6 overflow-y-auto">
              <SacredGeometryField
                service={labToolsService}
                meditationActive={meditationActive}
                selectedGeometry="golden_spiral"
              />
              <NOWModelMonitor service={labToolsService} />
              <ConsciousnessFieldMap service={labToolsService} />
            </div>

            {/* Right Panel - Biometrics & Safety for Meditation */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <BiometricStream service={labToolsService} />
              <GuardianStatus service={labToolsService} />
              <EmergencyControls service={labToolsService} />
              <FrequencySpectrum service={labToolsService} />
              <IntegrationNotes service={labToolsService} />
            </div>
          </>
        ) : activeView === 'dreams' ? (
          // Dream & Unconscious Integration View
          <>
            {/* Full Width Dream Journal Interface */}
            <div className="col-span-12">
              <DreamJournalInterface />
            </div>
          </>
        ) : activeView === 'shadow' ? (
          // Shadow Work View
          <>
            <div className="col-span-12">
              <div className="flex flex-col h-full">
                <div className="px-4 py-3 border-b border-white/5">
                  <h2 className="text-sm font-medium text-stone-300">Shadow Work</h2>
                  <p className="text-xs text-stone-500 mt-0.5">Integrative depth practice</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ShadowWorkGuide
                    userId="maia_labtools_demo"
                    onComplete={(responses) => {
                      console.log('Shadow work completed:', Object.keys(responses).length, 'responses');
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : activeView === 'computing' ? (
          // Consciousness Computing View
          <>
            {/* Left Panel - Computing Controls & AIN Evolution */}
            <div className="col-span-4 space-y-6 overflow-y-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3 flex items-center gap-2">
                  <span className="text-base">🛸</span> Consciousness Computing
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </h3>
                <p className="text-gray-300 text-[13px] tracking-wide mb-4">
                  Experience live consciousness technology integration: Pilot-Drone Interface,
                  AIN Evolution, and quantum field processing.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => window.open('/consciousness-computing', '_blank')}
                    className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg transition-all text-sm">
                    🌀 Full Portal
                  </button>
                  <button
                    onClick={() => window.open('/ain-demo', '_blank')}
                    className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all text-sm">
                    🧠 AIN Evolution Demo
                  </button>
                </div>
              </div>

              <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">🌀</span> Computing Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pilot Coherence:</span>
                    <span className="text-cyan-400 font-bold">{(Math.random() * 0.3 + 0.7).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantum Channels:</span>
                    <span className="text-cyan-400 font-bold">5 Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Observer Depth:</span>
                    <span className="text-purple-400 font-bold">{Math.floor(Math.random() * 3 + 2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emergence Events:</span>
                    <span className="text-green-400 font-bold">{Math.floor(Math.random() * 5 + 3)}</span>
                  </div>
                </div>
              </div>

              <BiometricStream service={labToolsService} />
            </div>

            {/* Center Panel - Pilot-Drone Interface */}
            <div className="col-span-5 space-y-6 overflow-y-auto">
              <PilotDroneVisualizer
                userId="maia_labtools_demo"
                consciousnessData={{
                  elementalSignature: {
                    fire: 0.75,
                    water: 0.68,
                    earth: 0.82,
                    air: 0.71,
                    aether: 0.79
                  }
                }}
              />
            </div>

            {/* Right Panel - Guardian & Computing Status */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <GuardianStatus service={labToolsService} />
              <EmergencyControls service={labToolsService} />

              <div className="bg-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">🔬</span> Theory Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Faggin Model:</span>
                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">ΔΩ Physics:</span>
                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Computing</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Spiralogic:</span>
                    <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded">Integrated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">AIN Evolution:</span>
                    <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-1 rounded">Phase 1</span>
                  </div>
                </div>
              </div>

              <FrequencySpectrum service={labToolsService} />
            </div>
          </>
        ) : (
          // IPP Clinical Assessment View
          <>
            {/* Left Panel - IPP Dashboard & Assessment Controls */}
            <div className="col-span-4 space-y-6 overflow-y-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">🏥</span> IPP Dashboard</h3>
                <p className="text-gray-300">IPP Dashboard coming soon...</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3 flex items-center gap-2">
                  <span className="text-base">👨‍👩‍👧‍👦</span> Integrated Parenting Protocol
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Assessments:</span>
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Completed Today:</span>
                    <span className="text-green-400 font-bold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Completion:</span>
                    <span className="text-blue-400 font-bold">18min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clinical Reviews:</span>
                    <span className="text-purple-400 font-bold">2 Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Panel - IPP Assessment Interface */}
            <div className="col-span-5 space-y-6 overflow-y-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">📋</span> IPP Assessment</h3>
                <p className="text-gray-300">IPP Assessment interface coming soon...</p>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">📊</span> Assessment Progress</h3>
                <div className="space-y-4">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-blue-400 h-3 rounded-full" style={{width: '65%'}}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Earth: Complete</span>
                    <span className="text-gray-400">Water: Complete</span>
                    <span className="text-blue-400">Fire: In Progress</span>
                    <span className="text-gray-500">Air: Pending</span>
                    <span className="text-gray-500">Aether: Pending</span>
                  </div>
                </div>
              </div>
              <NOWModelMonitor service={labToolsService} />
            </div>

            {/* Right Panel - Clinical Tools & Safety */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-sm font-medium tracking-wide text-white mb-3"><span className="text-base">🏥</span> Clinical Tools</h3>
                <div className="space-y-2">
                  <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 rounded-lg transition-all text-sm">
                    📋 New Assessment
                  </button>
                  <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg transition-all text-sm">
                    📊 Review Results
                  </button>
                  <button className="w-full py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-white border border-green-500/30 rounded-lg transition-all text-sm">
                    📝 Treatment Plan
                  </button>
                  <button className="w-full py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 hover:text-white border border-orange-500/30 rounded-lg transition-all text-sm">
                    ⚠️ Crisis Protocol
                  </button>
                </div>
              </div>
              <BiometricStream service={labToolsService} />
              <GuardianStatus service={labToolsService} />
              <EmergencyControls service={labToolsService} />
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <footer className="border-t border-purple-500/30 bg-black/50 backdrop-blur-sm px-6 py-2">
        <div className="flex justify-between items-center text-sm text-purple-300">
          <div className="flex gap-6">
            <span>🔌 OpenBCI: Connected</span>
            <span>🫀 HRV: Active</span>
            <span>🌐 Real-time: {Math.round(Math.random() * 10 + 90)}ms</span>
            {activeView === 'monitor' && (
              <>
                <span>📊 Live Stream: Active</span>
                <span>⚡ Breakthrough Detection: Online</span>
                <span>🧠 Neural Analysis: {Math.round(Math.random() * 20 + 180)}Hz</span>
              </>
            )}
            {activeView === 'meditation' && (
              <>
                <span>🧘 Sacred Audio: Ready</span>
                <span>🔯 Geometry: Active</span>
                <span>⚡ Breakthrough Detection: Online</span>
              </>
            )}
            {activeView === 'dreams' && (
              <>
                <span>🌙 Dreams: Active</span>
                <span>🎙️ Voice Recording: Ready</span>
                <span>🔮 DreamWeaver: Online</span>
                <span>🧠 Archetypal Analysis: Ready</span>
              </>
            )}
            {activeView === 'ipp' && (
              <>
                <span>👨‍👩‍👧‍👦 IPP: Active</span>
                <span>📋 Assessments: 3 Running</span>
                <span>🏥 Clinical Tools: Ready</span>
                <span>⚠️ Safety Monitor: Active</span>
              </>
            )}
            {activeView === 'computing' && (
              <>
                <span>🛸 Pilot-Drone: Online</span>
                <span>🌀 Quantum Channels: 5 Active</span>
                <span>🧠 AIN Evolution: Phase 1</span>
                <span>⚡ Consciousness Computing: Live</span>
              </>
            )}
            {activeView === 'shadow' && (
              <>
                <span>🌑 Shadow Work: Active</span>
                <span>🪞 Integration: Ready</span>
                <span>✨ Archetypal Awareness: Online</span>
              </>
            )}
          </div>
          <div className="text-xs flex gap-4">
            <span>View: {
              activeView === 'monitor' ? '📊 Monitor' :
              activeView === 'consciousness' ? '🧠 Consciousness' :
              activeView === 'meditation' ? '🧘 Meditation' :
              activeView === 'dreams' ? '🌙 Dreams' :
              activeView === 'shadow' ? '🌑 Shadow' :
              activeView === 'computing' ? '🛸 Computing' :
              '👨‍👩‍👧‍👦 IPP'
            }</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </footer>

      {/* Field Coherence Drawer */}
      <SacredLabDrawer
        isOpen={isFieldDrawerOpen}
        onClose={() => setIsFieldDrawerOpen(false)}
        title="MAIA Field Coherence"
      >
        <div className="space-y-4">
          <div className="text-[#E5D6C5] text-sm mb-4">
            Real-time consciousness field monitoring, elemental balance tracking,
            and breakthrough trajectory analysis.
          </div>
          {/* Temporary placeholder for FieldCoherenceDashboard */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">🌊 Field Coherence Dashboard</h3>
            <p className="text-gray-300">Field coherence monitoring dashboard will be restored soon...</p>
          </div>
        </div>
      </SacredLabDrawer>
    </div>
  );
}