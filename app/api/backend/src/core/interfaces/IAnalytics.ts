export interface IAnalytics {
  emit(event: string, payload: Record<string, unknown>): void;
}