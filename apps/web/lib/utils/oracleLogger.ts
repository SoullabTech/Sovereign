// lib/utils/oracleLogger.ts
// Oracle insight logging utility

"use strict";

export interface OracleInsight {
  element?: string;
  energy?: string;
  message: string;
  timestamp?: Date;
  level?: 'info' | 'warning' | 'error' | 'sacred';
}

/**
 * Log oracle insights with elemental awareness
 */
export function logOracleInsight(insight: OracleInsight): void {
  const timestamp = insight.timestamp || new Date();
  const prefix = insight.element ? `[${insight.element.toUpperCase()}]` : '[ORACLE]';
  const energy = insight.energy ? ` (${insight.energy})` : '';

  const formattedMessage = `${prefix}${energy} ${insight.message}`;

  switch (insight.level) {
    case 'error':
      console.error(formattedMessage, timestamp);
      break;
    case 'warning':
      console.warn(formattedMessage, timestamp);
      break;
    case 'sacred':
      console.log(`✨ ${formattedMessage}`, timestamp);
      break;
    default:
      console.log(formattedMessage, timestamp);
  }
}

/**
 * Log elemental transition
 */
export function logElementalTransition(from: string, to: string, reason?: string): void {
  const message = reason
    ? `Elemental shift: ${from} → ${to} (${reason})`
    : `Elemental shift: ${from} → ${to}`;

  logOracleInsight({
    message,
    level: 'sacred'
  });
}

/**
 * Log voice synthesis event
 */
export function logVoiceEvent(event: string, details?: any): void {
  console.log(`🎤 Voice: ${event}`, details || '');
}