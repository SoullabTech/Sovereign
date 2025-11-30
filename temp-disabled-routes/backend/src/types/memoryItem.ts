export interface MemoryItem {
  id?: string;
  query: string;
  response: string;       // required for backward compatibility
  content?: string;       // alias for response
  timestamp?: string;
}
