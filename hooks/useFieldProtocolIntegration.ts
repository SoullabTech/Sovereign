// frontend
// apps/web/hooks/useFieldProtocolIntegration.ts

'use client';

export interface FieldProtocolConfig {
  practitionerId?: string;
  autoCapture?: boolean;
  captureThreshold?: number;
}

export interface FieldProtocolIntegration {
  /**
   * Whether the field protocol / experimental layer is active.
   * For now, we keep it false so it behaves like "off" by default.
   */
  isEnabled: boolean;

  /**
   * Optional registration hook – OracleConversation might call this
   * when mounting text or voice fields.
   */
  registerField: (fieldId: string, meta?: Record<string, any>) => void;

  /**
   * Optional event notifier – e.g. "user paused", "breakthrough moment", etc.
   */
  notifyFieldEvent: (
    fieldId: string,
    event: string,
    data?: Record<string, any>
  ) => void;

  // Properties expected by OracleConversation
  isRecording: boolean;
  startRecording: () => void;
  completeRecording: () => void;
  processMessage: (message: string | { content: string; timestamp: Date; speaker: string; metadata?: unknown }) => void;
  generateFieldRecord: () => Promise<unknown>;
}

/**
 * Temporary no-op hook to satisfy OracleConversation imports.
 * This keeps the "field protocol" turned off but structurally present,
 * so the rest of MAIA can render.
 */
export function useFieldProtocolIntegration(_config?: FieldProtocolConfig): FieldProtocolIntegration {
  const noop = () => {};
  const asyncNoop = async () => ({});

  return {
    isEnabled: false,
    registerField: noop,
    notifyFieldEvent: noop,
    isRecording: false,
    startRecording: noop,
    completeRecording: noop,
    processMessage: noop,
    generateFieldRecord: asyncNoop,
  };
}

export default useFieldProtocolIntegration;