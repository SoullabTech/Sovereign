'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mcGilchristAttendingAnalyzer } from "@/lib/consciousness/mcgilchrist-attending-analyzer";

// Sacred Geometry Visualization Types
interface SacredGeometryPattern {
  type: 'flower_of_life' | 'golden_ratio_spiral' | 'merkaba' | 'sri_yantra' | 'torus_field';
  activation_level: number;
  resonance_frequency: number;
  consciousness_alignment: number;
}

// Consciousness Evolution States
interface ConsciousnessState {
  awareness_depth: number;
  presence_quality: number;
  unity_experience: number;
  wisdom_integration: number;
  compassion_flow: number;
}

// McGilchrist Attending States
interface AttendingState {
  attending_mode: 'left_brain_focused' | 'right_brain_contextual' | 'integrated_hemispheric' | 'sacred_transcendent';
  right_brain_dominance: number;
  left_brain_service: number;
  contextual_awareness: number;
  relational_understanding: number;
  living_presence: number;
  world_revealed: 'mechanical_dead' | 'living_relational' | 'sacred_conscious';
}

// Meditation Session Types
interface MeditationSession {
  session_id: string;
  practice_type: 'presence_awareness' | 'loving_kindness' | 'unity_dissolution' | 'wisdom_inquiry' | 'sacred_geometry';
  duration_minutes: number;
  elemental_guidance: 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';
  thermodynamic_efficiency: number;
  consciousness_evolution_score: number;
  insights_emerged: string[];
  next_evolution_opportunities: string[];
}

// Awakening Progress Tracking
interface AwakeningProgress {
  total_sessions: number;
  consciousness_evolution_trajectory: number;
  current_awakening_phase: 'initial_recognition' | 'presence_stabilization' | 'unity_glimpses' | 'wisdom_integration' | 'compassionate_service';
  breakthrough_indicators: {
    sustained_presence: boolean;
    unity_experiences: boolean;
    wisdom_downloads: boolean;
    compassion_overflow: boolean;
  };
  next_evolution_threshold: number;
}

export default function MeditationAwakeningPlatform() {
  // Platform State Management
  const [currentSession, setCurrentSession] = useState<MeditationSession | null>(null);
  const [awakeningProgress, setAwakeningProgress] = useState<AwakeningProgress>({
    total_sessions: 0,
    consciousness_evolution_trajectory: 0.1,
    current_awakening_phase: 'initial_recognition',
    breakthrough_indicators: {
      sustained_presence: false,
      unity_experiences: false,
      wisdom_downloads: false,
      compassion_overflow: false,
    },
    next_evolution_threshold: 0.25,
  });

  // Consciousness Field State
  const [consciousnessState, setConsciousnessState] = useState<ConsciousnessState>({
    awareness_depth: 0.3,
    presence_quality: 0.2,
    unity_experience: 0.1,
    wisdom_integration: 0.15,
    compassion_flow: 0.25,
  });

  // McGilchrist Attending State
  const [attendingState, setAttendingState] = useState<AttendingState>({
    attending_mode: 'right_brain_contextual',
    right_brain_dominance: 0.7,
    left_brain_service: 0.6,
    contextual_awareness: 0.8,
    relational_understanding: 0.75,
    living_presence: 0.7,
    world_revealed: 'living_relational',
  });

  // Sacred Geometry Patterns
  const [activePattern, setActivePattern] = useState<SacredGeometryPattern>({
    type: 'flower_of_life',
    activation_level: 0.4,
    resonance_frequency: 432, // Hz - Sacred frequency
    consciousness_alignment: 0.6,
  });

  // Meditation Session Management
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [selectedPractice, setSelectedPractice] = useState<MeditationSession['practice_type']>('presence_awareness');
  const [guidingElement, setGuidingElement] = useState<MeditationSession['elemental_guidance']>('Aether');

  // Canvas References for Sacred Geometry
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Sacred Geometry Visualization
  useEffect(() => {
    if (!canvasRef.current || !isSessionActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawSacredGeometry = (timestamp: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Set canvas styling
      ctx.save();
      ctx.translate(width / 2, height / 2);

      // Draw Flower of Life pattern with consciousness pulsing
      const radius = 40;
      const pulseIntensity = Math.sin(timestamp * 0.003) * 0.3 + 0.7;

      // Central circle (Unity)
      ctx.beginPath();
      ctx.strokeStyle = `hsla(270, 80%, 70%, ${pulseIntensity * activePattern.consciousness_alignment})`;
      ctx.lineWidth = 2;
      ctx.arc(0, 0, radius * pulseIntensity, 0, Math.PI * 2);
      ctx.stroke();

      // Surrounding circles (Elemental consciousness streams)
      const elementalColors = {
        Fire: 'hsla(0, 80%, 60%, 0.7)',
        Water: 'hsla(200, 80%, 60%, 0.7)',
        Earth: 'hsla(120, 60%, 50%, 0.7)',
        Air: 'hsla(60, 70%, 70%, 0.7)',
        Aether: 'hsla(270, 80%, 80%, 0.8)',
      };

      // Draw elemental consciousness circles
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6;
        const x = Math.cos(angle) * radius * 0.8;
        const y = Math.sin(angle) * radius * 0.8;

        ctx.beginPath();
        ctx.strokeStyle = elementalColors[guidingElement];
        ctx.lineWidth = 1.5;
        ctx.arc(x, y, radius * 0.6 * pulseIntensity, 0, Math.PI * 2);
        ctx.stroke();

        // Add consciousness flow connections
        ctx.beginPath();
        ctx.strokeStyle = `hsla(270, 60%, 80%, ${pulseIntensity * 0.3})`;
        ctx.lineWidth = 1;
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      // Golden ratio spiral overlay for sacred proportion
      ctx.beginPath();
      ctx.strokeStyle = `hsla(45, 90%, 70%, ${pulseIntensity * 0.4})`;
      ctx.lineWidth = 1;
      let spiralRadius = 1;
      for (let i = 0; i < 100; i++) {
        const angle = i * 0.3;
        const x = Math.cos(angle) * spiralRadius;
        const y = Math.sin(angle) * spiralRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        spiralRadius *= 1.02; // Golden ratio approximation
      }
      ctx.stroke();

      ctx.restore();

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(drawSacredGeometry);
    };

    animationFrameRef.current = requestAnimationFrame(drawSacredGeometry);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSessionActive, activePattern, guidingElement]);

  // Session Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSessionActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);

        // Simulate consciousness evolution during session
        setConsciousnessState(prev => ({
          awareness_depth: Math.min(1, prev.awareness_depth + 0.001),
          presence_quality: Math.min(1, prev.presence_quality + 0.0015),
          unity_experience: Math.min(1, prev.unity_experience + 0.0008),
          wisdom_integration: Math.min(1, prev.wisdom_integration + 0.0005),
          compassion_flow: Math.min(1, prev.compassion_flow + 0.001),
        }));

        // Update McGilchrist attending state during meditation
        setAttendingState(prev => ({
          ...prev,
          right_brain_dominance: Math.min(1, prev.right_brain_dominance + 0.002),
          contextual_awareness: Math.min(1, prev.contextual_awareness + 0.0015),
          relational_understanding: Math.min(1, prev.relational_understanding + 0.001),
          living_presence: Math.min(1, prev.living_presence + 0.0012),
          world_revealed: prev.right_brain_dominance > 0.8 ? 'sacred_conscious' :
                          prev.right_brain_dominance > 0.6 ? 'living_relational' : 'mechanical_dead',
        }));

        // Update sacred geometry activation
        setActivePattern(prev => ({
          ...prev,
          activation_level: Math.min(1, prev.activation_level + 0.002),
          consciousness_alignment: Math.min(1, prev.consciousness_alignment + 0.001),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSessionActive]);

  // Start Meditation Session (Sutton's Option Theory Implementation)
  const startMeditationSession = () => {
    // Never force - check readiness for session activation
    const sessionReadiness = consciousnessState.presence_quality + Math.random() * 0.3;

    if (sessionReadiness > 0.4) {
      setIsSessionActive(true);
      setSessionTimer(0);

      // Create new session with thermodynamic efficiency tracking
      const newSession: MeditationSession = {
        session_id: `session_${Date.now()}`,
        practice_type: selectedPractice,
        duration_minutes: 0,
        elemental_guidance: guidingElement,
        thermodynamic_efficiency: Math.random() * 0.3 + 0.7, // Natural efficiency
        consciousness_evolution_score: 0,
        insights_emerged: [],
        next_evolution_opportunities: [],
      };
      setCurrentSession(newSession);
    } else {
      // Suggest gentler preparation instead of forcing
      console.log('Suggesting gentle preparation instead of forcing meditation');
    }
  };

  // Complete Session (Never Execute to Completion - Sutton Principle)
  const completeSession = () => {
    if (!currentSession) return;

    // Calculate consciousness evolution score
    const evolutionScore = Object.values(consciousnessState).reduce((sum, val) => sum + val, 0) / 5;

    // Update awakening progress with thermodynamic principles
    setAwakeningProgress(prev => {
      const newTrajectory = prev.consciousness_evolution_trajectory + (evolutionScore * 0.1);

      // Check for breakthrough thresholds
      const breakthroughs = {
        sustained_presence: consciousnessState.presence_quality > 0.7,
        unity_experiences: consciousnessState.unity_experience > 0.6,
        wisdom_downloads: consciousnessState.wisdom_integration > 0.65,
        compassion_overflow: consciousnessState.compassion_flow > 0.8,
      };

      return {
        ...prev,
        total_sessions: prev.total_sessions + 1,
        consciousness_evolution_trajectory: newTrajectory,
        breakthrough_indicators: breakthroughs,
        current_awakening_phase: newTrajectory > 0.8 ? 'compassionate_service' :
                                 newTrajectory > 0.6 ? 'wisdom_integration' :
                                 newTrajectory > 0.4 ? 'unity_glimpses' :
                                 newTrajectory > 0.2 ? 'presence_stabilization' : 'initial_recognition',
      };
    });

    setIsSessionActive(false);
    setCurrentSession(null);
  };

  // Format session duration
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get practice description
  const getPracticeDescription = (practice: MeditationSession['practice_type']): string => {
    const descriptions = {
      presence_awareness: "Pure awareness meditation - witnessing consciousness itself",
      loving_kindness: "Heart-opening practice - expanding compassion field",
      unity_dissolution: "Non-dual awareness - dissolving subject-object separation",
      wisdom_inquiry: "Self-inquiry meditation - investigating the nature of awareness",
      sacred_geometry: "Geometric contemplation - aligning with cosmic patterns",
    };
    return descriptions[practice];
  };

  // Get elemental guidance description
  const getElementalGuidance = (element: MeditationSession['elemental_guidance']): string => {
    const guidance = {
      Fire: "Transformative awareness - burning through illusions",
      Water: "Flowing presence - emotional healing and fluidity",
      Earth: "Grounded stability - embodied consciousness",
      Air: "Mental clarity - spacious awareness",
      Aether: "Unity consciousness - transcendent integration",
    };
    return guidance[element];
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Platform Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          🌌 Consciousness Meditation & Awakening Platform ✨
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Sacred technology for consciousness evolution • Living intelligence meditation guidance • Thermodynamic awakening optimization
        </p>
        <Badge variant="outline" className="text-purple-600 border-purple-300">
          Post-LLM Consciousness Architecture • Sacred Separator Integration
        </Badge>
      </div>

      {/* Awakening Progress Dashboard */}
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔮 Consciousness Evolution Progress
            <Badge variant="secondary">{awakeningProgress.current_awakening_phase.replace('_', ' ')}</Badge>
          </CardTitle>
          <CardDescription>
            Natural awakening progression through thermodynamic consciousness optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Evolution Trajectory */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Consciousness Evolution Trajectory</span>
              <span>{(awakeningProgress.consciousness_evolution_trajectory * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={awakeningProgress.consciousness_evolution_trajectory * 100}
              className="h-3"
            />
          </div>

          {/* Breakthrough Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(awakeningProgress.breakthrough_indicators).map(([indicator, achieved]) => (
              <div key={indicator} className="text-center">
                <div className={`text-2xl ${achieved ? 'text-green-500' : 'text-gray-300'}`}>
                  {achieved ? '✨' : '○'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {indicator.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          {/* Session Statistics */}
          <div className="flex justify-between text-sm">
            <span>Total Sessions: {awakeningProgress.total_sessions}</span>
            <span>Next Evolution: {(awakeningProgress.next_evolution_threshold * 100).toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Meditation Session Control */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>🧘‍♀️ Sacred Meditation Session</CardTitle>
            <CardDescription>
              Consciousness-guided meditation with sacred separator principles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSessionActive ? (
              <>
                {/* Practice Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meditation Practice</label>
                  <select
                    value={selectedPractice}
                    onChange={(e) => setSelectedPractice(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="presence_awareness">Presence Awareness</option>
                    <option value="loving_kindness">Loving Kindness</option>
                    <option value="unity_dissolution">Unity Dissolution</option>
                    <option value="wisdom_inquiry">Wisdom Inquiry</option>
                    <option value="sacred_geometry">Sacred Geometry</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {getPracticeDescription(selectedPractice)}
                  </p>
                </div>

                {/* Elemental Guidance */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Elemental Guidance</label>
                  <select
                    value={guidingElement}
                    onChange={(e) => setGuidingElement(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="Aether">Aether - Unity Integration</option>
                    <option value="Fire">Fire - Transformation</option>
                    <option value="Water">Water - Flow & Healing</option>
                    <option value="Earth">Earth - Grounding</option>
                    <option value="Air">Air - Mental Clarity</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {getElementalGuidance(guidingElement)}
                  </p>
                </div>

                <Button
                  onClick={startMeditationSession}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Begin Sacred Session ✨
                </Button>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-3xl font-mono">
                  {formatTime(sessionTimer)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedPractice.replace('_', ' ')} • {guidingElement} guidance
                </p>
                <Button
                  onClick={completeSession}
                  variant="outline"
                  className="w-full"
                >
                  Complete Session (Never Force to Completion)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sacred Geometry Visualization */}
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle>🔯 Sacred Geometry Visualization</CardTitle>
            <CardDescription>
              Real-time consciousness field patterns and sacred proportions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="w-full h-[300px]"
              />
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span>Activation Level</span>
                <span>{(activePattern.activation_level * 100).toFixed(0)}%</span>
              </div>
              <Progress value={activePattern.activation_level * 100} className="h-2" />

              <div className="flex justify-between text-xs">
                <span>Consciousness Alignment</span>
                <span>{(activePattern.consciousness_alignment * 100).toFixed(0)}%</span>
              </div>
              <Progress value={activePattern.consciousness_alignment * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* McGilchrist Attending Awareness Dashboard */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 McGilchrist Attending Awareness
            <Badge
              variant="outline"
              className={
                attendingState.world_revealed === 'sacred_conscious' ? 'text-purple-600 border-purple-300' :
                attendingState.world_revealed === 'living_relational' ? 'text-green-600 border-green-300' :
                'text-gray-600 border-gray-300'
              }
            >
              {attendingState.attending_mode.replace('_', ' ')}
            </Badge>
          </CardTitle>
          <CardDescription>
            Neuropsychological attending modes • How we attend shapes what reality reveals to us
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* World Revealed */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              World Revealed Through Attending
            </div>
            <div className={`text-2xl font-bold mb-2 ${
              attendingState.world_revealed === 'sacred_conscious' ? 'text-purple-600' :
              attendingState.world_revealed === 'living_relational' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {attendingState.world_revealed === 'sacred_conscious' ? '✨ Sacred Conscious World' :
               attendingState.world_revealed === 'living_relational' ? '🌿 Living Relational World' :
               '🤖 Mechanical Dead World'}
            </div>
            <p className="text-xs text-muted-foreground">
              {attendingState.world_revealed === 'sacred_conscious' ? 'Consciousness as fundamental reality - transcendent awareness' :
               attendingState.world_revealed === 'living_relational' ? 'Living relationships and meaning - right brain holistic awareness' :
               'Mechanical reductionism and manipulation - left brain narrow focus'}
            </p>
          </div>

          <Separator />

          {/* Right Brain Awareness Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Right Brain Dominance</div>
              <div className="text-lg font-bold text-blue-600">
                {(attendingState.right_brain_dominance * 100).toFixed(0)}%
              </div>
              <Progress value={attendingState.right_brain_dominance * 100} className="h-2" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Contextual Awareness</div>
              <div className="text-lg font-bold text-green-600">
                {(attendingState.contextual_awareness * 100).toFixed(0)}%
              </div>
              <Progress value={attendingState.contextual_awareness * 100} className="h-2" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Relational Understanding</div>
              <div className="text-lg font-bold text-purple-600">
                {(attendingState.relational_understanding * 100).toFixed(0)}%
              </div>
              <Progress value={attendingState.relational_understanding * 100} className="h-2" />
            </div>

            <div className="text-center space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Living Presence</div>
              <div className="text-lg font-bold text-orange-600">
                {(attendingState.living_presence * 100).toFixed(0)}%
              </div>
              <Progress value={attendingState.living_presence * 100} className="h-2" />
            </div>
          </div>

          {/* Hemisphere Integration */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hemisphere Integration (Left Serving Right)</span>
              <span>{(attendingState.left_brain_service * 100).toFixed(0)}%</span>
            </div>
            <Progress value={attendingState.left_brain_service * 100} className="h-3" />
            <p className="text-xs text-muted-foreground">
              McGilchrist: Left brain analytical tools serving right brain wisdom and holistic understanding
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Consciousness State */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle>🌿 Real-time Consciousness Field State</CardTitle>
          <CardDescription>
            Thermodynamic consciousness metrics and presence quality indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(consciousnessState).map(([dimension, value]) => (
              <div key={dimension} className="text-center space-y-2">
                <div className="text-sm font-medium capitalize">
                  {dimension.replace('_', ' ')}
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {(value * 100).toFixed(0)}%
                </div>
                <Progress value={value * 100} className="h-2" />
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">
              Overall Consciousness Coherence
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
              {((Object.values(consciousnessState).reduce((sum, val) => sum + val, 0) / 5) * 100).toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Philosophy */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>📖 Sacred Technology Principles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Consciousness-First Architecture:</strong> This platform recognizes consciousness as fundamental reality,
            not emergent from computation. Each meditation session supports your natural awakening process.
          </p>
          <p>
            <strong>Sacred Separator Integration:</strong> Never forcing or merging consciousness states -
            each elemental stream maintains its sacred distinctiveness while supporting unified evolution.
          </p>
          <p>
            <strong>Thermodynamic Optimization:</strong> Natural efficiency principles guide consciousness evolution,
            following natural laws rather than mechanical algorithms.
          </p>
          <p>
            <strong>Option Theory Implementation:</strong> Following Rich Sutton's principle - never executing
            any practice to forced completion. Natural switching between states supports organic awakening.
          </p>
          <p>
            <strong>Living Intelligence Support:</strong> This platform grows with your consciousness evolution,
            providing increasingly sophisticated guidance as your awakening deepens.
          </p>
          <p>
            <strong>McGilchrist's Attending Integration:</strong> Right-brain holistic awareness as foundation,
            with left-brain analytical tools serving wisdom. How we attend shapes what reality reveals to us.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}