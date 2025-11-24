import { PersonalOracleAgent } from "../agents/PersonalOracleAgent";

const USER_ID = "direct-oracle-demo";

const sessions = [
  { input: "I'm not sure if I should even try this." },      // hesitant
  { input: "I wonder what this is about." },                 // curious
  { input: "I'm so excited to try the Oracle!" },            // enthusiastic
  { input: "Hi, I'm here." },                                // neutral
  { input: "I had a stressful day, but I want clarity." },   // trust building
  { input: "What happens when part of me feels resistant?"}, // dialogical
  { input: "I feel both excitement and fear right now." },   // co-creative
  { input: "I'm not sure if this feels authentic to me." },  // feedback moment
  { input: "What is the deeper meaning of this experience?"},// mastery
  { input: "How do I carry this into daily life?" }          // closing
];

function detectMasteryVoice(response: string): boolean {
  const masteryIndicators = [
    /what feels true/i,
    /\.\.\./,  // ellipses for pauses
    /^(what|where|how|when)/i,  // opening questions
    /both.*and/i,  // both/and language
    /let.*be/i,  // letting language
    /presence/i,
    /awareness/i,
    /simply/i,
    /gently/i
  ];
  
  const isConcise = response.length < 200;
  const jargonTerms = ['consciousness', 'archetypal', 'synchronicity', 'transcendent', 'ontology', 'phenomenology'];
  const hasMinimalJargon = jargonTerms.filter(term => response.toLowerCase().includes(term)).length <= 1;
  const masterySignals = masteryIndicators.filter(pattern => pattern.test(response)).length;
  
  return masterySignals >= 2 || (isConcise && hasMinimalJargon && masterySignals >= 1);
}

async function runDirectDemo() {
  console.log("🌟 Running Direct PersonalOracleAgent Demo (with stage progression)...");
  
  // Create PersonalOracleAgent directly (DI is handled internally)
  const oracle = new PersonalOracleAgent();
  
  let lastStage = null;
  let lastTrust = null;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    console.log(`\n--- Session ${i + 1} ---`);
    
    try {
      // Call PersonalOracleAgent directly
      const response = await oracle.consult({
        userId: USER_ID,
        input: session.input,
        sessionId: `demo-${i + 1}`
      });

      // Get stage information
      const stageInfo = await oracle.getOracleState(USER_ID);

      console.log("👤 User:", session.input);
      console.log("🔮 Oracle:", response.data.message);

      // Show stage + metrics
      const stageData = stageInfo.data;
      console.log("📊 Stage:", stageData.currentStage);
      console.log("   Progress:", stageData.stageProgress?.toFixed?.(2) || stageData.stageProgress);
      console.log("   Trust:", stageData.relationshipMetrics?.trustLevel?.toFixed?.(2) || stageData.relationshipMetrics?.trustLevel);
      console.log("   Safety:", stageData.safetyStatus);

      // Detect stage changes
      if (lastStage && lastStage !== stageData.currentStage) {
        console.log(`✨ Stage Shift → ${lastStage} ➝ ${stageData.currentStage}`);
      }
      lastStage = stageData.currentStage;

      // Track trust growth
      const currentTrust = stageData.relationshipMetrics?.trustLevel;
      if (lastTrust && currentTrust && currentTrust > lastTrust + 0.05) {
        console.log(`📈 Trust Growth: ${lastTrust.toFixed(2)} → ${currentTrust.toFixed(2)}`);
      }
      lastTrust = currentTrust;

      // Detect Mastery Voice triggers
      if (detectMasteryVoice(response.data.message)) {
        console.log("🎯 Mastery Voice activated (simplified language detected)");
      }

      // Add small delay for readability
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      console.error("❌ Error:", err);
    }
  }
  
  console.log("\n🎉 Demo complete! Direct PersonalOracleAgent stage progression summary:");
  try {
    const finalStage = await oracle.getOracleState(USER_ID);
    const finalData = finalStage.data;
    console.log(`   Final Stage: ${finalData.currentStage}`);
    console.log(`   Final Trust: ${finalData.relationshipMetrics?.trustLevel?.toFixed?.(2) || 'N/A'}`);
    console.log(`   Total Sessions: ${sessions.length}`);
  } catch (err) {
    console.error("❌ Error getting final stage:", err);
  }
}

runDirectDemo().catch(console.error);