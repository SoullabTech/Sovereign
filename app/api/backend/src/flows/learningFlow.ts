import type { Session, MemoryItem, SessionStats } from "../types";
import { FlowManager } from "./index";

export class LearningFlow {
  private flowManager: FlowManager;
  private session: Session | null = null;
  private clientId: string;

  constructor(clientId: string) {
    this.flowManager = new FlowManager();
    this.clientId = clientId;
  }

  async start(): Promise<{
    session: Session;
    initialMemory: MemoryItem;
  }> {
    const result = await this.flowManager.startLearningFlow(this.clientId);
    this.session = result.session;
    return result;
  }

  async processInteraction(content: string): Promise<{
    memory: MemoryItem;
    insights: string[];
  }> {
    if (!this.session) {
      throw new Error("Learning flow not started");
    }

    return this.flowManager.processInteractionFlow(
      this.clientId,
      this.session.id,
      content,
    );
  }

  async complete(): Promise<{
    sessionStats: SessionStats;
    finalInsights: string[];
  }> {
    if (!this.session) {
      throw new Error("Learning flow not started");
    }

    return this.flowManager.completeLearningFlow(
      this.clientId,
      this.session.id,
    );
  }
}
