import { CollectiveDaimonicSnapshot, DaimonicDetected } from '../types/daimonic';
import { EventEmitter } from 'events';

export class DaimonicReservoirService {
  private eventEmitter: EventEmitter;
  private currentSnapshot: CollectiveDaimonicSnapshot;
  private detectionHistory: DaimonicDetected[] = [];
  private snapshotInterval: NodeJS.Timeout | null = null;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this.currentSnapshot = this.initializeSnapshot();
    this.startSnapshotEmission();
    this.listenForDetections();
  }

  private initializeSnapshot(): CollectiveDaimonicSnapshot {
    return {
      timestamp: new Date().toISOString(),
      fieldIntensity: 0.1,
      collectiveMyth: 'Learning to hold paradox with grace',
      culturalCompensation: 'Balancing abstraction with embodiment',
      tricksterPrevalence: 0.0,
      bothAndRate: 0.0,
      activeElements: ['earth']
    };
  }

  private listenForDetections(): void {
    this.eventEmitter.on('daimonic.experience.detected', (detection: DaimonicDetected) => {
      this.processDetection(detection);
    });
  }

  private processDetection(detection: DaimonicDetected): void {
    // Add to history (keep last 100)
    this.detectionHistory.push(detection);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory.shift();
    }

    // Update collective metrics
    this.updateCollectiveMetrics();
  }

  private updateCollectiveMetrics(): void {
    const recent = this.getRecentDetections(24); // Last 24 hours
    
    if (recent.length === 0) return;

    // Calculate field intensity (average liminal weight)
    const liminalWeights = recent.map(d => d.liminal.weight);
    this.currentSnapshot.fieldIntensity = liminalWeights.reduce((a, b) => a + b, 0) / liminalWeights.length;

    // Calculate trickster prevalence
    const tricksterRisks = recent.map(d => d.trickster.risk);
    this.currentSnapshot.tricksterPrevalence = tricksterRisks.reduce((a, b) => a + b, 0) / tricksterRisks.length;

    // Calculate both-and rate
    const bothAndCount = recent.filter(d => d.bothAnd.signature).length;
    this.currentSnapshot.bothAndRate = bothAndCount / recent.length;

    // Update collective myth based on patterns
    this.currentSnapshot.collectiveMyth = this.inferCollectiveMyth(recent);
    
    // Update cultural compensation
    this.currentSnapshot.culturalCompensation = this.inferCulturalCompensation(recent);
    
    // Update active elements
    this.currentSnapshot.activeElements = this.inferActiveElements(recent);
    
    this.currentSnapshot.timestamp = new Date().toISOString();
  }

  private getRecentDetections(hours: number): DaimonicDetected[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return this.detectionHistory.filter(d => d.ts > cutoff);
  }

  private inferCollectiveMyth(detections: DaimonicDetected[]): string {
    const highTrickster = this.currentSnapshot.tricksterPrevalence > 0.4;
    const highBothAnd = this.currentSnapshot.bothAndRate > 0.3;
    const highIntensity = this.currentSnapshot.fieldIntensity > 0.5;

    if (highTrickster && highIntensity) {
      return 'Learning through sacred mischief and teaching riddles';
    }
    
    if (highBothAnd && highIntensity) {
      return 'Practicing the art of holding multiple truths simultaneously';
    }
    
    if (highIntensity) {
      return 'Navigating threshold times with careful attention';
    }
    
    const spiritPullCount = detections.filter(d => d.spiritSoul.pull === 'spirit').length;
    const soulPullCount = detections.filter(d => d.spiritSoul.pull === 'soul').length;
    
    if (spiritPullCount > soulPullCount * 1.5) {
      return 'Seeking grounded expression for elevated insights';
    }
    
    if (soulPullCount > spiritPullCount * 1.5) {
      return 'Deepening into embodied wisdom and practical truth';
    }
    
    return 'Learning to hold paradox with grace';
  }

  private inferCulturalCompensation(detections: DaimonicDetected[]): string {
    const compensationPatterns = [
      'Balancing abstraction with embodiment',
      'Balancing overwhelm with a single clear view',
      'Balancing speed with depth',
      'Balancing individual insight with collective wisdom',
      'Balancing certainty with healthy mystery',
      'Balancing action with reflection'
    ];
    
    // Simple rotation based on field characteristics
    const index = Math.floor(this.currentSnapshot.fieldIntensity * compensationPatterns.length);
    return compensationPatterns[Math.min(index, compensationPatterns.length - 1)];
  }

  private inferActiveElements(detections: DaimonicDetected[]): Array<'fire' | 'water' | 'earth' | 'air' | 'aether'> {
    const elementCounts: Record<string, number> = {};
    
    detections.forEach(d => {
      Object.entries(d.elements).forEach(([element, score]) => {
        if (score && score > 20) { // Threshold for "active"
          elementCounts[element] = (elementCounts[element] || 0) + 1;
        }
      });
    });
    
    // Return elements with significant presence
    return Object.entries(elementCounts)
      .filter(([_, count]) => count > detections.length * 0.2)
      .map(([element]) => element as 'fire' | 'water' | 'earth' | 'air' | 'aether');
  }

  private startSnapshotEmission(): void {
    // Emit snapshot every 5 minutes
    this.snapshotInterval = setInterval(() => {
      this.eventEmitter.emit('collective.daimonic.snapshot', this.currentSnapshot);
    }, 5 * 60 * 1000);
  }

  public getCurrentSnapshot(): CollectiveDaimonicSnapshot {
    return { ...this.currentSnapshot };
  }

  public getDetectionHistory(): DaimonicDetected[] {
    return [...this.detectionHistory];
  }

  public destroy(): void {
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
    }
  }
}