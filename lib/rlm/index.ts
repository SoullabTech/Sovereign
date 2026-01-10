/**
 * RLM (Retrieval-augmented Language Model) Module
 *
 * Agentic retrieval pattern for navigating knowledge sources.
 * Uses local LLM to iteratively search, read, and synthesize answers.
 */

export { navigateCodebase, askAboutCode } from './CodebaseNavigator';
export { searchCode, readFileContent, listFiles, executeAction } from './tools';
export type {
  RLMActionType,
  RLMAction,
  SearchAction,
  ReadAction,
  ListAction,
  AnswerAction,
  AnyRLMAction,
  ToolResult,
  RLMContext,
  RLMConfig,
  RLMResult,
} from './types';
