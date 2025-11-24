// Stub for analytics tracking to satisfy OracleConversation imports

export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  console.log(`📊 [STUB] Track event: ${eventName}`, properties);
}