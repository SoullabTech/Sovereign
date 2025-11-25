/**
 * MAIA SDK Base Provider
 *
 * Abstract base class that all provider adapters must implement.
 * This ensures a consistent interface regardless of the underlying service.
 */

import {
  ProviderMetadata,
  ProviderConfig,
  ConversationContext,
  Connection,
} from '../core/types';

export abstract class BaseProvider {
  abstract metadata: ProviderMetadata;

  protected eventListeners: Map<string, Function[]> = new Map();
  protected isInitialized: boolean = false;

  /**
   * Initialize the provider with configuration
   */
  abstract initialize(config: ProviderConfig): Promise<void>;

  /**
   * Connect to the provider service
   */
  abstract connect(context: ConversationContext): Promise<Connection>;

  /**
   * Send audio data to the provider
   */
  abstract sendAudio(audioData: ArrayBuffer): Promise<void>;

  /**
   * Send text to the provider
   */
  abstract sendText(text: string): Promise<void>;

  /**
   * Disconnect from the provider
   */
  abstract disconnect(): Promise<void>;

  /**
   * Register event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all registered listeners
   */
  protected emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Check if provider has a specific capability
   */
  hasCapability(capability: string): boolean {
    return this.metadata.capabilities.includes(capability as any);
  }

  /**
   * Get provider info for logging/debugging
   */
  getInfo(): { id: string; name: string; capabilities: string[] } {
    return {
      id: this.metadata.id,
      name: this.metadata.name,
      capabilities: this.metadata.capabilities
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.eventListeners.clear();
    this.isInitialized = false;
  }
}
