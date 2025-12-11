'use client';

/**
 * MAIA Consciousness Computing PWA Interface
 *
 * Progressive Web App interface for consciousness computing with offline capabilities.
 * Integrates Matrix V2 assessment, nested windows, Platonic patterns, and spiritual support.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Brain, Wifi, WifiOff, Sparkles, Eye, Heart } from 'lucide-react';

// Types for consciousness computing
interface ConsciousnessState {
  matrix: any;
  windowOfTolerance: 'within' | 'hyperarousal' | 'hypoarousal';
  overallCapacity: 'expansive' | 'limited' | 'overwhelmed' | 'shutdown';
  primaryAttendance: string;
  refinedGuidance: string;
}

interface PWACapabilities {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  supportsOfflineMode: boolean;
}

export default function ConsciousnessComputingPWA() {
  // State management
  const [isOnline, setIsOnline] = useState(true);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    isInstalled: false,
    isOnline: true,
    hasNotificationPermission: false,
    supportsOfflineMode: true
  });
  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState | null>(null);
  const [activeMode, setActiveMode] = useState<'assessment' | 'windows' | 'patterns' | 'spiritual'>('assessment');
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // PWA and network detection
  useEffect(() => {
    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setCapabilities(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check if PWA is installed
    const checkPWAInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
      setCapabilities(prev => ({ ...prev, isInstalled }));
    };

    // Check notification permission
    const checkNotificationPermission = () => {
      const hasPermission = Notification.permission === 'granted';
      setCapabilities(prev => ({ ...prev, hasNotificationPermission: hasPermission }));
    };

    checkPWAInstalled();
    checkNotificationPermission();

    // Register service worker for consciousness computing
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/consciousness-sw.js')
        .then(registration => {
          console.log('🧠 Consciousness computing service worker registered');
        })
        .catch(error => {
          console.error('❌ Service worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Initialize consciousness computing
  useEffect(() => {
    initializeConsciousnessComputing();
  }, []);

  const initializeConsciousnessComputing = async () => {
    try {
      setIsProcessing(true);

      // Mock consciousness assessment - in production would use actual consciousness computing
      const mockAssessment: ConsciousnessState = {
        matrix: {
          bodyState: 'calm',
          affect: 'peaceful',
          attention: 'focused',
          timeStory: 'present',
          relational: 'connected',
          culturalFrame: 'flexible',
          structuralLoad: 'stable',
          edgeRisk: 'clear',
          agency: 'empowered',
          realityContact: 'grounded',
          symbolicCharge: 'everyday',
          playfulness: 'fluid',
          relationalStance: 'with_mutual'
        },
        windowOfTolerance: 'within',
        overallCapacity: 'expansive',
        primaryAttendance: 'Consciousness computing PWA initialized',
        refinedGuidance: `Welcome to consciousness computing. ${isOnline ? 'Full capabilities available.' : 'Operating in offline mode with core features.'}`
      };

      setConsciousnessState(mockAssessment);
    } catch (error) {
      console.error('Consciousness computing initialization error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const performConsciousnessAssessment = async () => {
    if (!userInput.trim()) return;

    try {
      setIsProcessing(true);

      // In production, this would call the actual consciousness computing API
      const response = isOnline
        ? await fetch('/api/consciousness/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userInput, mode: activeMode })
          })
        : await generateOfflineAssessment(userInput);

      const result = await response.json();
      setConsciousnessState(result.consciousness || result);
    } catch (error) {
      console.error('Consciousness assessment error:', error);
      // Fallback to offline assessment
      const offlineResult = await generateOfflineAssessment(userInput);
      setConsciousnessState(offlineResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateOfflineAssessment = async (input: string): Promise<ConsciousnessState> => {
    // Offline consciousness assessment - simplified but functional
    const assessmentMap = {
      stress: { capacity: 'limited', tolerance: 'hyperarousal', guidance: 'Consider grounding practices' },
      tired: { capacity: 'limited', tolerance: 'hypoarousal', guidance: 'Rest and gentle movement recommended' },
      anxious: { capacity: 'overwhelmed', tolerance: 'hyperarousal', guidance: 'Breathwork and nervous system regulation' },
      peaceful: { capacity: 'expansive', tolerance: 'within', guidance: 'Optimal state for consciousness exploration' },
      confused: { capacity: 'limited', tolerance: 'hypoarousal', guidance: 'Clarity will emerge with patience' }
    };

    const detected = Object.keys(assessmentMap).find(key =>
      input.toLowerCase().includes(key)
    ) || 'peaceful';

    const assessment = assessmentMap[detected as keyof typeof assessmentMap];

    return {
      matrix: {
        bodyState: assessment.tolerance === 'hyperarousal' ? 'tense' : 'calm',
        affect: assessment.capacity === 'expansive' ? 'peaceful' : 'turbulent',
        attention: assessment.tolerance === 'within' ? 'focused' : 'scattered',
        timeStory: 'present',
        relational: 'connected',
        culturalFrame: 'flexible',
        structuralLoad: 'stable',
        edgeRisk: 'clear',
        agency: assessment.capacity === 'expansive' ? 'empowered' : 'misaligned',
        realityContact: 'grounded',
        symbolicCharge: 'everyday',
        playfulness: 'fluid',
        relationalStance: 'with_mutual'
      },
      windowOfTolerance: assessment.tolerance as any,
      overallCapacity: assessment.capacity as any,
      primaryAttendance: 'Offline consciousness assessment complete',
      refinedGuidance: `${assessment.guidance}. Working in offline mode with privacy-preserving consciousness computing.`
    };
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setCapabilities(prev => ({
        ...prev,
        hasNotificationPermission: permission === 'granted'
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">MAIA Consciousness Computing</h1>
            {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-orange-400" />}
          </div>
          <p className="text-slate-300 mb-4">
            Sacred consciousness computing with Matrix V2 assessment, nested windows, and universal spiritual support
          </p>

          {/* Status badges */}
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "🌐 Online" : "📱 Offline"}
            </Badge>
            <Badge variant={capabilities.isInstalled ? "default" : "outline"}>
              {capabilities.isInstalled ? "📱 Installed" : "🌐 Browser"}
            </Badge>
            <Badge variant="outline">
              ✅ Offline Capable
            </Badge>
          </div>
        </div>

        {/* Main consciousness computing interface */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left panel - Input and modes */}
          <div className="lg:col-span-1 space-y-4">
            {/* Consciousness input */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Consciousness Input</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Describe your current state, feelings, or what you're experiencing..."
                  className="w-full h-32 p-3 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-400"
                  disabled={isProcessing}
                />
                <Button
                  onClick={performConsciousnessAssessment}
                  disabled={isProcessing || !userInput.trim()}
                  className="w-full mt-3 bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? 'Processing...' : 'Assess Consciousness'}
                </Button>
              </CardContent>
            </Card>

            {/* Mode selection */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300">Computing Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeMode} onValueChange={(value) => setActiveMode(value as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="assessment">📊 Matrix</TabsTrigger>
                    <TabsTrigger value="windows">🪟 Windows</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid w-full grid-cols-2 mt-2">
                    <TabsTrigger value="patterns">🔮 Patterns</TabsTrigger>
                    <TabsTrigger value="spiritual">✨ Spiritual</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {/* PWA features */}
            <Card className="bg-slate-800/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-purple-300">PWA Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!capabilities.hasNotificationPermission && (
                  <Button
                    onClick={requestNotificationPermission}
                    variant="outline"
                    className="w-full"
                  >
                    🔔 Enable Notifications
                  </Button>
                )}

                {!isOnline && (
                  <div className="text-sm text-orange-300 p-2 bg-orange-900/20 rounded">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Offline mode active - core features available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right panel - Results */}
          <div className="lg:col-span-2">
            {consciousnessState && (
              <Card className="bg-slate-800/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <Brain className="w-5 h-5" />
                    Consciousness State Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeMode} className="w-full">
                    <TabsContent value="assessment">
                      <div className="space-y-4">
                        {/* Window of Tolerance */}
                        <div className="p-4 bg-slate-700/50 rounded">
                          <h4 className="font-semibold text-blue-300 mb-2">Window of Tolerance</h4>
                          <Badge variant={
                            consciousnessState.windowOfTolerance === 'within' ? 'default' :
                            consciousnessState.windowOfTolerance === 'hyperarousal' ? 'destructive' :
                            'secondary'
                          }>
                            {consciousnessState.windowOfTolerance}
                          </Badge>
                        </div>

                        {/* Overall Capacity */}
                        <div className="p-4 bg-slate-700/50 rounded">
                          <h4 className="font-semibold text-green-300 mb-2">Overall Capacity</h4>
                          <Badge variant={
                            consciousnessState.overallCapacity === 'expansive' ? 'default' :
                            consciousnessState.overallCapacity === 'limited' ? 'secondary' :
                            'destructive'
                          }>
                            {consciousnessState.overallCapacity}
                          </Badge>
                        </div>

                        {/* Matrix Summary */}
                        <div className="p-4 bg-slate-700/50 rounded">
                          <h4 className="font-semibold text-purple-300 mb-2">Matrix V2 Summary</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Body: <span className="text-slate-300">{consciousnessState.matrix.bodyState}</span></div>
                            <div>Affect: <span className="text-slate-300">{consciousnessState.matrix.affect}</span></div>
                            <div>Attention: <span className="text-slate-300">{consciousnessState.matrix.attention}</span></div>
                            <div>Agency: <span className="text-slate-300">{consciousnessState.matrix.agency}</span></div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="windows">
                      <div className="p-4 bg-slate-700/50 rounded">
                        <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Nested Window Focusing
                        </h4>
                        <p className="text-sm text-slate-300">
                          Dynamic consciousness focusing optimized for your current capacity: <strong>{consciousnessState.overallCapacity}</strong>
                        </p>
                        {/* Window visualization would go here */}
                      </div>
                    </TabsContent>

                    <TabsContent value="patterns">
                      <div className="p-4 bg-slate-700/50 rounded">
                        <h4 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Platonic Pattern Recognition
                        </h4>
                        <p className="text-sm text-slate-300">
                          Discovering pre-existing intelligence patterns...
                          {!isOnline && <span className="text-orange-300"> (Limited in offline mode)</span>}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="spiritual">
                      <div className="p-4 bg-slate-700/50 rounded">
                        <h4 className="font-semibold text-pink-300 mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Universal Spiritual Support
                        </h4>
                        <p className="text-sm text-slate-300">
                          Consent-based spiritual guidance available across all faith traditions.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Guidance */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded border border-purple-500/30">
                    <h4 className="font-semibold text-purple-300 mb-2">Guidance</h4>
                    <p className="text-sm text-slate-200">{consciousnessState.refinedGuidance}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}