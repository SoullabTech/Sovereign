// /src/main/CollaborationSession.ts

import { AgentCollaboration } from "../agents/AgentCollaboration";
import { SpiralogicAgent } from "../agents/SpiralogicAgent";

// Create multiple agents for the collaboration session
const agent1 = new SpiralogicAgent(agentContext1, userProfile);
const agent2 = new SpiralogicAgent(agentContext2, userProfile);

// Setup the collaboration environment
const collaboration = new AgentCollaboration([agent1, agent2]);

// Run a collaborative query
const query = "How can I evolve my personal growth?";
collaboration.collaborateOnQuery(query).then((response) => {
  console.log(`Collaborative Agent Response: ${response}`);
});
