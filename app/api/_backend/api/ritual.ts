// backend/flows/ritual.ts

const ritualFlow = (
  userContext: UserContext,
  memoryAgent: BowTieMemoryAgent,
) => {
  const feedback = shadowOracle(userContext.currentPhase, memoryAgent);
  return `Your ritual feedback: ${feedback}`;
};
