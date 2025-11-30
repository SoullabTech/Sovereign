import { EventEmitter } from 'events';

export interface EEGState {
  fp1: number[];
  fp2: number[];
  t7: number[];
  t8: number[];
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
  timestamp: number;
}

export interface HRVState {
  coherence: number;
  rmssd: number;
  heartRate: number;
  timestamp: number;
}

export interface GuardianState {
  field: 'safe' | 'caution' | 'warning' | 'emergency';
  psyche: 'safe' | 'caution' | 'warning' | 'emergency';
  soma: 'safe' | 'caution' | 'warning' | 'emergency';
  meaning: 'safe' | 'caution' | 'warning' | 'emergency';
  window: 'optimal' | 'hyperarousal' | 'hypoarousal' | 'overwhelm';
  alerts: GuardianAlert[];
}

export interface GuardianAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  layer: 'field' | 'psyche' | 'soma' | 'meaning';
  message: string;
  timestamp: number;
  recommendations: string[];
}

export interface FieldState {
  torus: TorusField;
  couplings: CouplingKernel[];
  recognizedPatterns: string[];
  coherenceField: number;
}

export interface TorusField {
  coherence: number;
  symmetry: number;
  flow: number;
  geometry: 'balanced' | 'expanding' | 'contracting' | 'chaotic';
}

export interface CouplingKernel {
  frequency: number;
  amplitude: number;
  phase: number;
  coupling: number;
}

export interface Protocol {
  id: string;
  name: string;
  category: string;
  intensity: number;
  duration: number;
  description: string;
  safetyLevel: 'gentle' | 'moderate' | 'intense' | 'advanced';
}

export interface NOWModelState {
  windows: ObserverWindow[];
  overallSynchrony: number;
  overallCoherence: number;
  overallCoupling: number;
  integrationQuality: number;
  temporalHierarchy: 'stable' | 'emerging' | 'disrupted' | 'transforming';
  timestamp: number;
}

export interface ObserverWindow {
  id: string;
  name: string;
  timeScale: string;
  frequency: number;
  synchrony: number;
  coherence: number;
  coupling: number;
  status: 'integrated' | 'communicating' | 'coupled' | 'disconnected';
  level: number; // Hierarchy level (0=fastest, higher=slower)
}

export class LabToolsService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;

  // Real-time state
  private currentEEG: EEGState | null = null;
  private currentHRV: HRVState | null = null;
  private currentGuardian: GuardianState | null = null;
  private currentField: FieldState | null = null;
  private currentNOW: NOWModelState | null = null;
  private activeProtocol: Protocol | null = null;

  constructor() {
    super();
    this.setupSimulation(); // For development before hardware arrives
  }

  async connect(): Promise<void> {
    if (this.isConnecting || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      // In production, this would connect to your WebSocket server
      // For now, we'll simulate the connection
      await this.simulateConnection();
      this.emit('connected');
    } catch (error) {
      console.error('LabTools connection failed:', error);
      this.emit('connectionError', error);
      this.scheduleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async simulateConnection(): Promise<void> {
    // Simulate WebSocket connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start data simulation
    this.startDataSimulation();
    console.log('🧠 LabTools Service: Simulation mode active');
  }

  private startDataSimulation(): void {
    // Simulate real-time EEG data
    setInterval(() => {
      this.currentEEG = this.generateSimulatedEEG();
      this.emit('eegUpdate', this.currentEEG);
    }, 100); // 10Hz updates

    // Simulate HRV data
    setInterval(() => {
      this.currentHRV = this.generateSimulatedHRV();
      this.emit('hrvUpdate', this.currentHRV);
    }, 1000); // 1Hz updates

    // Simulate Guardian assessments
    setInterval(() => {
      this.currentGuardian = this.generateGuardianAssessment();
      this.emit('guardianUpdate', this.currentGuardian);
    }, 2000); // 0.5Hz updates

    // Simulate consciousness field
    setInterval(() => {
      this.currentField = this.generateFieldState();
      this.emit('fieldUpdate', this.currentField);
    }, 500); // 2Hz updates

    // Simulate NOW model metrics
    setInterval(() => {
      this.currentNOW = this.generateNOWModelState();
      this.emit('nowUpdate', this.currentNOW);
    }, 750); // 1.33Hz updates
  }

  private generateSimulatedEEG(): EEGState {
    const baseFreq = 0.1 + Math.random() * 0.2;
    const timestamp = Date.now();

    // Generate 4-channel EEG (200 samples at 200Hz = 1 second of data)
    const generateChannel = () =>
      Array.from({ length: 200 }, (_, i) =>
        Math.sin(i * baseFreq + Math.random() * 0.1) * (50 + Math.random() * 50)
      );

    return {
      fp1: generateChannel(),
      fp2: generateChannel(),
      t7: generateChannel(),
      t8: generateChannel(),
      delta: Math.random() * 0.3 + 0.1,
      theta: Math.random() * 0.4 + 0.2,
      alpha: Math.random() * 0.6 + 0.3,
      beta: Math.random() * 0.5 + 0.2,
      gamma: Math.random() * 0.3 + 0.1,
      timestamp
    };
  }

  private generateSimulatedHRV(): HRVState {
    return {
      coherence: Math.random() * 0.8 + 0.2,
      rmssd: Math.random() * 50 + 20,
      heartRate: Math.random() * 20 + 60,
      timestamp: Date.now()
    };
  }

  private generateGuardianAssessment(): GuardianState {
    const states: Array<'safe' | 'caution' | 'warning' | 'emergency'> =
      ['safe', 'safe', 'safe', 'caution', 'caution', 'warning'];

    const windows: Array<'optimal' | 'hyperarousal' | 'hypoarousal' | 'overwhelm'> =
      ['optimal', 'optimal', 'optimal', 'hyperarousal', 'hypoarousal'];

    return {
      field: states[Math.floor(Math.random() * states.length)],
      psyche: states[Math.floor(Math.random() * states.length)],
      soma: states[Math.floor(Math.random() * states.length)],
      meaning: states[Math.floor(Math.random() * states.length)],
      window: windows[Math.floor(Math.random() * windows.length)],
      alerts: this.generateRandomAlerts()
    };
  }

  private generateRandomAlerts(): GuardianAlert[] {
    const alerts: GuardianAlert[] = [];

    if (Math.random() < 0.3) { // 30% chance of alert
      alerts.push({
        id: Date.now().toString(),
        type: Math.random() < 0.7 ? 'info' : 'warning',
        layer: ['field', 'psyche', 'soma', 'meaning'][Math.floor(Math.random() * 4)] as any,
        message: [
          'Theta activity increasing - deep state detected',
          'Heart coherence fluctuation noticed',
          'Gamma spike - heightened awareness state',
          'Integration opportunity detected'
        ][Math.floor(Math.random() * 4)],
        timestamp: Date.now(),
        recommendations: [
          'Continue with current protocol',
          'Consider gentle grounding',
          'Monitor for 30 seconds'
        ]
      });
    }

    return alerts;
  }

  private generateFieldState(): FieldState {
    return {
      torus: {
        coherence: Math.random() * 0.8 + 0.2,
        symmetry: Math.random() * 0.9 + 0.1,
        flow: Math.random() * 0.7 + 0.3,
        geometry: ['balanced', 'expanding', 'contracting'][Math.floor(Math.random() * 3)] as any
      },
      couplings: Array.from({ length: 5 }, () => ({
        frequency: Math.random() * 40 + 5,
        amplitude: Math.random() * 1,
        phase: Math.random() * 360,
        coupling: Math.random() * 0.8 + 0.2
      })),
      recognizedPatterns: [
        'Sacred Geometry Active',
        'Torus Flow Detected',
        'Coupling Resonance'
      ].filter(() => Math.random() > 0.5),
      coherenceField: Math.random() * 0.8 + 0.2
    };
  }

  private generateNOWModelState(): NOWModelState {
    // Generate nested observer windows with realistic temporal scales
    const windows: ObserverWindow[] = [
      {
        id: 'gamma',
        name: 'Gamma',
        timeScale: '10-50ms',
        frequency: 35 + Math.random() * 10,
        synchrony: Math.random() * 0.4 + 0.6, // High synchrony for fast windows
        coherence: Math.random() * 0.6 + 0.2,
        coupling: Math.random() * 0.3 + 0.1,
        status: Math.random() > 0.3 ? 'integrated' : 'communicating',
        level: 0
      },
      {
        id: 'beta',
        name: 'Beta',
        timeScale: '50-100ms',
        frequency: 18 + Math.random() * 12,
        synchrony: Math.random() * 0.5 + 0.4,
        coherence: Math.random() * 0.7 + 0.3,
        coupling: Math.random() * 0.4 + 0.2,
        status: Math.random() > 0.25 ? 'communicating' : 'integrated',
        level: 1
      },
      {
        id: 'alpha',
        name: 'Alpha',
        timeScale: '100-200ms',
        frequency: 8 + Math.random() * 4,
        synchrony: Math.random() * 0.6 + 0.3,
        coherence: Math.random() * 0.8 + 0.2,
        coupling: Math.random() * 0.5 + 0.3,
        status: Math.random() > 0.2 ? 'communicating' : 'coupled',
        level: 2
      },
      {
        id: 'theta',
        name: 'Theta',
        timeScale: '200ms-1s',
        frequency: 4 + Math.random() * 3,
        synchrony: Math.random() * 0.7 + 0.2,
        coherence: Math.random() * 0.9 + 0.1,
        coupling: Math.random() * 0.6 + 0.4,
        status: Math.random() > 0.15 ? 'coupled' : 'communicating',
        level: 3
      },
      {
        id: 'delta',
        name: 'Delta',
        timeScale: '1-10s',
        frequency: 0.5 + Math.random() * 1.5,
        synchrony: Math.random() * 0.5 + 0.3,
        coherence: Math.random() * 0.7 + 0.2,
        coupling: Math.random() * 0.8 + 0.2,
        status: Math.random() > 0.1 ? 'coupled' : 'disconnected',
        level: 4
      },
      {
        id: 'flow',
        name: 'Flow State',
        timeScale: '10s-5min',
        frequency: 0.1 + Math.random() * 0.2,
        synchrony: Math.random() * 0.4 + 0.2, // Lower synchrony for slow windows
        coherence: Math.random() * 0.6 + 0.3,
        coupling: Math.random() * 0.9 + 0.1,
        status: Math.random() > 0.4 ? 'coupled' : 'disconnected',
        level: 5
      }
    ];

    // Calculate overall metrics
    const overallSynchrony = windows.reduce((sum, w) => sum + w.synchrony, 0) / windows.length;
    const overallCoherence = windows.reduce((sum, w) => sum + w.coherence, 0) / windows.length;
    const overallCoupling = windows.reduce((sum, w) => sum + w.coupling, 0) / windows.length;

    // Integration quality depends on balance of all three principles
    const integrationQuality = (overallSynchrony * 0.4 + overallCoherence * 0.35 + overallCoupling * 0.25);

    // Determine temporal hierarchy state
    let temporalHierarchy: 'stable' | 'emerging' | 'disrupted' | 'transforming';
    if (integrationQuality > 0.75) {
      temporalHierarchy = 'stable';
    } else if (integrationQuality > 0.5) {
      temporalHierarchy = 'emerging';
    } else if (integrationQuality > 0.3) {
      temporalHierarchy = 'transforming';
    } else {
      temporalHierarchy = 'disrupted';
    }

    return {
      windows,
      overallSynchrony,
      overallCoherence,
      overallCoupling,
      integrationQuality,
      temporalHierarchy,
      timestamp: Date.now()
    };
  }

  private setupSimulation(): void {
    // Initialize with default states
    this.currentGuardian = {
      field: 'safe',
      psyche: 'safe',
      soma: 'safe',
      meaning: 'safe',
      window: 'optimal',
      alerts: []
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    this.reconnectInterval = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    this.emit('disconnected');
  }

  // Public getters for current state
  getCurrentEEG(): EEGState | null { return this.currentEEG; }
  getCurrentHRV(): HRVState | null { return this.currentHRV; }
  getCurrentGuardian(): GuardianState | null { return this.currentGuardian; }
  getCurrentField(): FieldState | null { return this.currentField; }
  getCurrentNOW(): NOWModelState | null { return this.currentNOW; }
  getActiveProtocol(): Protocol | null { return this.activeProtocol; }

  // Protocol control methods
  async startProtocol(protocol: Protocol): Promise<void> {
    this.activeProtocol = protocol;
    this.emit('protocolStarted', protocol);
    console.log(`🎛️ Started protocol: ${protocol.name}`);
  }

  async stopProtocol(): Promise<void> {
    const stoppedProtocol = this.activeProtocol;
    this.activeProtocol = null;
    this.emit('protocolStopped', stoppedProtocol);
    console.log('🛑 Protocol stopped');
  }

  async emergencyStop(): Promise<void> {
    await this.stopProtocol();
    this.emit('emergencyStop');
    console.log('🚨 EMERGENCY STOP ACTIVATED');
  }
}