export interface OracleInsight {
  id?: string;
  userId: string;
  agentType: string;
  query: string;
  response: string;
  content?: string;        // alias for response
  anon_id?: string;        // optional legacy field
}
