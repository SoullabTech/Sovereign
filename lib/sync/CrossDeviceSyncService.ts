/**
 * Cross-Device Synchronization Service
 * Syncs personalization, emotional states, and Sacred Oracle insights across devices
 * Uses Supabase realtime subscriptions for instant updates
 */

import { createClient } from '@/lib/supabase';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { PersonalizationSettings } from '../context/OraclePersonalizationContext';
import { UnifiedEmotionalSignature } from '../voice/IntegratedEmotionalResonance';

export interface SyncedUserState {
  userId: string;
  deviceId: string;
  personalization: PersonalizationSettings;
  emotionalHistory: UnifiedEmotionalSignature[];
  sacredOracleProfile: SacredOracleProfile;
  lastSyncedAt: string;
  devices: DeviceInfo[];
}

export interface SacredOracleProfile {
  consciousnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  dominantElement: string;
  elementalBalance: Record<string, number>;
  archetypePattern: string;
  collectiveContribution: number;
  indrasWebConnections: number;
  sacredWisdomAccessed: string[];
  ritualsPracticed: string[];
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop' | 'web';
  platform: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
}

export interface SyncEvent {
  type: 'personalization' | 'emotional' | 'sacred' | 'full';
  data: any;
  deviceId: string;
  timestamp: string;
}

export class CrossDeviceSyncService {
  private static instance: CrossDeviceSyncService;
  private supabase: SupabaseClient;
  private realtimeChannel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private deviceId: string;
  private syncListeners: Map<string, (event: SyncEvent) => void> = new Map();
  private syncQueue: SyncEvent[] = [];
  private isOnline = true;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Generate or retrieve device ID
    this.deviceId = this.getOrCreateDeviceId();

    // Set up online/offline detection
    this.setupConnectivityMonitoring();

    // Start periodic sync
    this.startPeriodicSync();
  }

  public static getInstance(): CrossDeviceSyncService {
    if (!CrossDeviceSyncService.instance) {
      CrossDeviceSyncService.instance = new CrossDeviceSyncService();
    }
    return CrossDeviceSyncService.instance;
  }

  /**
   * Initialize sync for a user
   */
  public async initializeForUser(userId: string): Promise<void> {
    this.userId = userId;

    // Register this device
    await this.registerDevice();

    // Set up realtime subscription
    await this.setupRealtimeSync();

    // Perform initial sync
    await this.performFullSync();
  }

  /**
   * Register current device
   */
  private async registerDevice(): Promise<void> {
    if (!this.userId) return;

    const deviceInfo: DeviceInfo = {
      id: this.deviceId,
      name: this.getDeviceName(),
      type: this.getDeviceType(),
      platform: navigator.platform,
      lastActiveAt: new Date().toISOString(),
      isCurrentDevice: true
    };

    // Update device registry
    const { error } = await this.supabase
      .from('user_devices')
      .upsert({
        user_id: this.userId,
        device_id: this.deviceId,
        device_info: deviceInfo,
        last_active_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to register device:', error);
    }

    // Mark other devices as not current
    await this.supabase
      .from('user_devices')
      .update({ is_current: false })
      .eq('user_id', this.userId)
      .neq('device_id', this.deviceId);
  }

  /**
   * Set up realtime synchronization
   */
  private async setupRealtimeSync(): Promise<void> {
    if (!this.userId) return;

    // Clean up existing channel
    if (this.realtimeChannel) {
      await this.supabase.removeChannel(this.realtimeChannel);
    }

    // Create new channel for user
    this.realtimeChannel = this.supabase
      .channel(`sync:${this.userId}`)
      .on(
        'broadcast',
        { event: 'sync' },
        (payload) => this.handleRealtimeSync(payload)
      )
      .on(
        'presence',
        { event: 'sync' },
        (payload) => this.handlePresenceSync(payload)
      )
      .subscribe();
  }

  /**
   * Handle realtime sync events
   */
  private handleRealtimeSync(payload: any): void {
    const syncEvent = payload.payload as SyncEvent;

    // Ignore events from current device
    if (syncEvent.deviceId === this.deviceId) return;

    // Notify listeners
    this.notifyListeners(syncEvent);

    // Apply sync based on type
    switch (syncEvent.type) {
      case 'personalization':
        this.applyPersonalizationSync(syncEvent.data);
        break;
      case 'emotional':
        this.applyEmotionalSync(syncEvent.data);
        break;
      case 'sacred':
        this.applySacredOracleSync(syncEvent.data);
        break;
      case 'full':
        this.applyFullSync(syncEvent.data);
        break;
    }
  }

  /**
   * Handle presence sync for active devices
   */
  private handlePresenceSync(payload: any): void {
    // Track which devices are currently active
    const activeDevices = Object.keys(payload.presences || {});
    
    // Update UI to show active devices
    this.notifyListeners({
      type: 'presence' as any,
      data: { activeDevices },
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Sync personalization settings
   */
  public async syncPersonalization(settings: PersonalizationSettings): Promise<void> {
    const syncEvent: SyncEvent = {
      type: 'personalization',
      data: settings,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    };

    if (this.isOnline) {
      await this.broadcastSync(syncEvent);
      await this.persistSync(syncEvent);
    } else {
      this.queueSync(syncEvent);
    }
  }

  /**
   * Sync emotional state
   */
  public async syncEmotionalState(signature: UnifiedEmotionalSignature): Promise<void> {
    const syncEvent: SyncEvent = {
      type: 'emotional',
      data: signature,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    };

    if (this.isOnline) {
      await this.broadcastSync(syncEvent);
      await this.persistEmotionalState(signature);
    } else {
      this.queueSync(syncEvent);
    }
  }

  /**
   * Sync Sacred Oracle insights
   */
  public async syncSacredOracleInsight(insight: any): Promise<void> {
    const syncEvent: SyncEvent = {
      type: 'sacred',
      data: insight,
      deviceId: this.deviceId,
      timestamp: new Date().toISOString()
    };

    if (this.isOnline) {
      await this.broadcastSync(syncEvent);
      await this.persistSacredInsight(insight);
    } else {
      this.queueSync(syncEvent);
    }
  }

  /**
   * Broadcast sync event to other devices
   */
  private async broadcastSync(event: SyncEvent): Promise<void> {
    if (!this.realtimeChannel) return;

    await this.realtimeChannel.send({
      type: 'broadcast',
      event: 'sync',
      payload: event
    });
  }

  /**
   * Persist sync event to database
   */
  private async persistSync(event: SyncEvent): Promise<void> {
    if (!this.userId) return;

    const { error } = await this.supabase
      .from('sync_events')
      .insert({
        user_id: this.userId,
        device_id: event.deviceId,
        event_type: event.type,
        event_data: event.data,
        created_at: event.timestamp
      });

    if (error) {
      console.error('Failed to persist sync event:', error);
    }
  }

  /**
   * Persist emotional state to database
   */
  private async persistEmotionalState(signature: UnifiedEmotionalSignature): Promise<void> {
    if (!this.userId) return;

    const { error } = await this.supabase
      .from('emotional_states')
      .insert({
        user_id: this.userId,
        device_id: this.deviceId,
        resonance: signature.resonance,
        emotion: signature.emotion,
        elemental_blend: signature.elementalEmotionBlend,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to persist emotional state:', error);
    }
  }

  /**
   * Persist Sacred Oracle insight
   */
  private async persistSacredInsight(insight: any): Promise<void> {
    if (!this.userId) return;

    const { error } = await this.supabase
      .from('sacred_insights')
      .insert({
        user_id: this.userId,
        device_id: this.deviceId,
        insight_data: insight,
        consciousness_level: insight.consciousnessProfile?.developmentalLevel,
        dominant_element: insight.dominantElement,
        collective_contribution: insight.collectiveField?.contribution,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to persist sacred insight:', error);
    }
  }

  /**
   * Queue sync event for offline processing
   */
  private queueSync(event: SyncEvent): void {
    this.syncQueue.push(event);
    
    // Store in localStorage for persistence
    localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
  }

  /**
   * Process queued sync events
   */
  private async processQueuedSyncs(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const event of queue) {
      await this.broadcastSync(event);
      await this.persistSync(event);
    }

    // Clear localStorage queue
    localStorage.removeItem('sync_queue');
  }

  /**
   * Perform full sync from cloud
   */
  public async performFullSync(): Promise<SyncedUserState | null> {
    if (!this.userId) return null;

    try {
      // Get latest personalization
      const { data: personalization } = await this.supabase
        .from('user_personalization')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      // Get recent emotional states
      const { data: emotionalStates } = await this.supabase
        .from('emotional_states')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false })
        .limit(50);

      // Get Sacred Oracle profile
      const { data: sacredProfile } = await this.supabase
        .from('sacred_oracle_profiles')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      // Get all devices
      const { data: devices } = await this.supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', this.userId);

      return {
        userId: this.userId,
        deviceId: this.deviceId,
        personalization: personalization?.settings || {},
        emotionalHistory: emotionalStates || [],
        sacredOracleProfile: sacredProfile || this.getDefaultSacredProfile(),
        lastSyncedAt: new Date().toISOString(),
        devices: devices?.map(d => d.device_info) || []
      };
    } catch (error) {
      console.error('Full sync failed:', error);
      return null;
    }
  }

  /**
   * Apply synced data from other devices
   */
  private applyPersonalizationSync(settings: PersonalizationSettings): void {
    // Update localStorage
    localStorage.setItem('oracle_personalization', JSON.stringify(settings));
    
    // Dispatch event for UI update
    window.dispatchEvent(new CustomEvent('personalization-synced', { detail: settings }));
  }

  private applyEmotionalSync(signature: UnifiedEmotionalSignature): void {
    // Update emotional history
    window.dispatchEvent(new CustomEvent('emotional-synced', { detail: signature }));
  }

  private applySacredOracleSync(insight: any): void {
    // Update Sacred Oracle state
    window.dispatchEvent(new CustomEvent('sacred-synced', { detail: insight }));
  }

  private applyFullSync(state: SyncedUserState): void {
    this.applyPersonalizationSync(state.personalization);
    // Apply other state updates
    window.dispatchEvent(new CustomEvent('full-sync', { detail: state }));
  }

  /**
   * Set up connectivity monitoring
   */
  private setupConnectivityMonitoring(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueuedSyncs();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Load queued syncs from localStorage
    const queuedSyncs = localStorage.getItem('sync_queue');
    if (queuedSyncs) {
      this.syncQueue = JSON.parse(queuedSyncs);
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.userId) {
        this.performFullSync();
      }
    }, 30000);
  }

  /**
   * Subscribe to sync events
   */
  public subscribe(callback: (event: SyncEvent) => void): string {
    const id = `listener_${Date.now()}_${Math.random()}`;
    this.syncListeners.set(id, callback);
    return id;
  }

  /**
   * Unsubscribe from sync events
   */
  public unsubscribe(id: string): void {
    this.syncListeners.delete(id);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: SyncEvent): void {
    this.syncListeners.forEach(callback => callback(event));
  }

  /**
   * Get or create device ID
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Get device name
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (/iPhone/.test(userAgent)) return 'iPhone';
    if (/iPad/.test(userAgent)) return 'iPad';
    if (/Android/.test(userAgent)) return 'Android Device';
    if (/Mac/.test(userAgent)) return 'Mac';
    if (/Windows/.test(userAgent)) return 'Windows PC';
    return 'Web Browser';
  }

  /**
   * Get device type
   */
  private getDeviceType(): DeviceInfo['type'] {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get default Sacred Oracle profile
   */
  private getDefaultSacredProfile(): SacredOracleProfile {
    return {
      consciousnessLevel: 'beginner',
      dominantElement: 'earth',
      elementalBalance: {
        fire: 0.2,
        water: 0.2,
        earth: 0.2,
        air: 0.2,
        aether: 0.2
      },
      archetypePattern: 'The Seeker',
      collectiveContribution: 0,
      indrasWebConnections: 0,
      sacredWisdomAccessed: [],
      ritualsPracticed: []
    };
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    if (this.realtimeChannel) {
      await this.supabase.removeChannel(this.realtimeChannel);
    }
    
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncListeners.clear();
  }
}