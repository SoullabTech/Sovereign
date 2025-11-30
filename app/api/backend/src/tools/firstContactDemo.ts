import fetch from "node-fetch";

const BASE_URL = "http://localhost:3002/api/oracle/chat";
const STATE_URL = "http://localhost:3002/api/oracle/stage";
const USER_ID = "first-contact-demo";

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

async function fetchStage(): Promise<any> {
  const res = await fetch(`${STATE_URL}?userId=${USER_ID}`);
  const data = await res.json() as any;
  return data?.data || {};
}

function detectMasteryVoice(response: string): boolean {
  // Detect simplified language patterns that suggest Mastery Voice
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
  
  // Check if response is concise (mastery tends to be shorter)
  const isConcise = response.length < 200;
  
  // Check for mystical jargon reduction (fewer complex terms)
  const jargonTerms = ['consciousness', 'archetypal', 'synchronicity', 'transcendent', 'ontology', 'phenomenology'];
  const hasMinimalJargon = jargonTerms.filter(term => response.toLowerCase().includes(term)).length <= 1;
  
  const masterySignals = masteryIndicators.filter(pattern => pattern.test(response)).length;
  
  return masterySignals >= 2 || (isConcise && hasMinimalJargon && masterySignals >= 1);
}

async function runDemo() {
  console.log("🌟 Running First Contact Demo (with stage progression tracking)...");
  let lastStage = null;
  let lastTrust = null;

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    console.log(`\n--- Session ${i + 1} ---`);
    
    try {
      // Call consult with Spiralogic orchestrator
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-experiment-spiralogic": "on"
        },
        body: JSON.stringify({
          text: session.input,
          userId: USER_ID,
          sessionId: `demo-${i + 1}`
        })
      });

      const data = await res.json() as any;
      const stage = await fetchStage();

      console.log("👤 User:", session.input);
      console.log("🔮 Oracle:", (data as any)?.data?.message || data);

      // Show stage + metrics
      console.log("📊 Stage:", stage.currentStage);
      console.log("   Progress:", stage.stageProgress?.toFixed?.(2) || stage.stageProgress);
      console.log("   Trust:", stage.relationshipMetrics?.trustLevel?.toFixed?.(2) || stage.relationshipMetrics?.trustLevel);
      console.log("   Safety:", stage.safetyStatus);

      // Detect stage changes
      if (lastStage && lastStage !== stage.currentStage) {
        console.log(`✨ Stage Shift → ${lastStage} ➝ ${stage.currentStage}`);
      }
      lastStage = stage.currentStage;

      // Track trust growth
      const currentTrust = stage.relationshipMetrics?.trustLevel;
      if (lastTrust && currentTrust && currentTrust > lastTrust + 0.05) {
        console.log(`📈 Trust Growth: ${lastTrust.toFixed(2)} → ${currentTrust.toFixed(2)}`);
      }
      lastTrust = currentTrust;

      // Detect Mastery Voice triggers
      const response = (data as any)?.data?.message || "";
      if (detectMasteryVoice(response)) {
        console.log("🎯 Mastery Voice activated (simplified language detected)");
      }

      // Add small delay for readability
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (err) {
      console.error("❌ Error:", err);
    }
  }
  
  console.log("\n🎉 Demo complete! Stage progression summary:");
  const finalStage = await fetchStage();
  console.log(`   Final Stage: ${finalStage.currentStage}`);
  console.log(`   Final Trust: ${finalStage.relationshipMetrics?.trustLevel?.toFixed?.(2) || 'N/A'}`);
  console.log(`   Total Sessions: ${sessions.length}`);
}

runDemo();