// MAIA Empowerment Test Script
// Use this to test the empowerment orchestrator

const testEmpowerment = async () => {
  const response = await fetch('/api/empowerment/orchestrate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: 'test-member-001',
      memberInput: 'I feel stuck in my current situation and want to serve better',
      context: {
        developmentPhase: 'awareness',
        urgencyLevel: 'development',
        serviceAspirations: 'community_service'
      }
    })
  });

  const result = await response.json();
  console.log('Empowerment Response:', result);
  return result;
};

// Run test
testEmpowerment().catch(console.error);