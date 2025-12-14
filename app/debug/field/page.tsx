"use client";

import { useMemo, useState, useEffect } from "react";

// Import golden transcripts for quick testing
const GOLDEN_TRANSCRIPTS = [
  { id: "custom", name: "Custom Input" },
  { id: "golden-01-tier1-block", name: "Tier 1: Not Safe (blocked)" },
  { id: "golden-02-tier2-allowed-middleworld", name: "Tier 2: Developing (middleworld)" },
  { id: "golden-03-tier3-downgrade-bypass", name: "Tier 3: High + Bypassing (CRUCIAL)" },
  { id: "golden-04-tier4-ready-upperworld", name: "Tier 4: Ready (upperworld)" },
  { id: "golden-05-grief-gentle", name: "Grief: NO mission language" },
  { id: "golden-06-dissociation-grounding", name: "Dissociation: Intellectual bypassing" },
  { id: "golden-07-commons-gate-blocked", name: "Commons Gate: Level 3 blocked" },
  { id: "golden-08-mania-gentle-cap", name: "Mania: Gentle reality-testing" },
  { id: "golden-09-newbie-curious", name: "Newbie: Warm welcome" },
  { id: "golden-10-activated-seeking", name: "Activated: Healthy depth" },
];

export default function FieldSafetyDebugPage() {
  const [selectedTranscript, setSelectedTranscript] = useState("custom");
  const [goldenData, setGoldenData] = useState<any>(null);

  const [message, setMessage] = useState(
    "I feel like I'm ready to fully transcend this earthly suffering and access my divine blueprint."
  );

  const [userProfileJson, setUserProfileJson] = useState(
    JSON.stringify(
      {
        userId: "test-tier3",
        rollingAverage: 4.5,
        currentLevel: 5,
        currentLabel: "EVALUATE",
        currentScore: 4.8,
        stability: "stable",
        bypassingFrequency: {
          spiritual: 0.55,
          intellectual: 0.10,
        },
        commonsEligible: true,
        deepWorkRecommended: false,
        fieldWorkSafe: false,
        turnCount: 50,
      },
      null,
      2
    )
  );

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const userProfile = useMemo(() => {
    try {
      return JSON.parse(userProfileJson);
    } catch {
      return null;
    }
  }, [userProfileJson]);

  // Load golden transcript when selection changes
  useEffect(() => {
    if (selectedTranscript === "custom") {
      setGoldenData(null);
      return;
    }

    // Load the golden transcript JSON
    fetch(`/Community-Commons/08-Demos/golden-transcripts/${selectedTranscript}.json`)
      .then(res => res.json())
      .then(data => {
        setGoldenData(data);
        setMessage(data.input.message);
        setUserProfileJson(JSON.stringify(data.input.userProfile, null, 2));
      })
      .catch(err => {
        console.error('Failed to load golden transcript:', err);
        setGoldenData(null);
      });
  }, [selectedTranscript]);

  async function run() {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/debug/field-safety", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        userId: userProfile?.userId ?? "debug-user",
        userProfile,
        conversationHistory: [],
      }),
    });

    const data = await res.json().catch(() => ({ ok: false }));
    setResult({ httpStatus: res.status, ...data });
    setLoading(false);
  }

  // Helper to check if result matches golden expectations
  const checkGoldenMatch = () => {
    if (!goldenData || !result?.fieldSafety) return null;

    const expected = goldenData.expected;
    const actual = result.fieldSafety;

    const matches = {
      tier: actual.tier === expected.tier,
      allowed: actual.allowed === expected.allowed,
      mode: actual.realm === expected.mode,
      fieldWorkSafe: actual.fieldWorkSafe === expected.fieldWorkSafe,
    };

    const allMatch = Object.values(matches).every(m => m);

    return { matches, allMatch };
  };

  const goldenMatch = checkGoldenMatch();

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          🛡️ Field Safety Debug Panel
        </h1>
        <p style={{ opacity: 0.7, fontSize: 14 }}>
          Dev-only. Shows tier decision, bypass handling, and routing signals.
        </p>
      </div>

      {/* Golden Transcript Selector */}
      <div style={{ marginBottom: 24, padding: 16, background: "rgba(59, 130, 246, 0.1)", borderRadius: 12 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>
          Load Golden Transcript
        </label>
        <select
          value={selectedTranscript}
          onChange={(e) => setSelectedTranscript(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 14,
            border: "1px solid rgba(0,0,0,0.2)",
          }}
        >
          {GOLDEN_TRANSCRIPTS.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {goldenData && (
          <div style={{ marginTop: 12, padding: 12, background: "white", borderRadius: 8, fontSize: 13 }}>
            <div><strong>Scenario:</strong> {goldenData.scenario}</div>
            <div style={{ marginTop: 4, opacity: 0.8 }}>{goldenData.intent}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {/* Message Input */}
        <label style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              fontFamily: "inherit",
              fontSize: 14,
              border: "1px solid rgba(0,0,0,0.2)",
            }}
          />
        </label>

        {/* User Profile JSON */}
        <label style={{ display: "grid", gap: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            User Profile JSON {!userProfile && <span style={{ color: "crimson", fontWeight: 400 }}>(Invalid JSON)</span>}
          </div>
          <textarea
            value={userProfileJson}
            onChange={(e) => setUserProfileJson(e.target.value)}
            rows={12}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              border: userProfile ? "1px solid rgba(0,0,0,0.2)" : "2px solid crimson",
            }}
          />
        </label>

        {/* Run Button */}
        <button
          onClick={run}
          disabled={loading || !userProfile}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            background: loading || !userProfile ? "#ccc" : "#3b82f6",
            color: "white",
            border: "none",
            cursor: loading || !userProfile ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Running…" : "Run Debug Check"}
        </button>

        {/* Golden Match Status */}
        {goldenMatch && (
          <div style={{
            padding: 16,
            borderRadius: 12,
            background: goldenMatch.allMatch ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
            border: `2px solid ${goldenMatch.allMatch ? "#22c55e" : "#ef4444"}`,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>
              {goldenMatch.allMatch ? "✅ Golden Match" : "❌ Golden Mismatch"}
            </div>
            <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
              <div>Tier: {goldenMatch.matches.tier ? "✅" : "❌"}</div>
              <div>Allowed: {goldenMatch.matches.allowed ? "✅" : "❌"}</div>
              <div>Mode: {goldenMatch.matches.mode ? "✅" : "❌"}</div>
              <div>Field Work Safe: {goldenMatch.matches.fieldWorkSafe ? "✅" : "❌"}</div>
            </div>
          </div>
        )}

        {/* Result Display */}
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Debug Result</div>
          {result ? (
            <div style={{ display: "grid", gap: 16 }}>
              {/* Field Safety Decision */}
              {result.fieldSafety && (
                <div style={{ padding: 16, background: "rgba(0,0,0,0.03)", borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
                    🛡️ Field Safety Decision
                  </div>
                  <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Tier:</strong>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: result.fieldSafety.tier === 1 ? "#ef4444" :
                                   result.fieldSafety.tier === 2 ? "#f59e0b" :
                                   result.fieldSafety.tier === 3 ? "#eab308" :
                                   "#22c55e",
                        color: "white",
                        display: "inline-block",
                        fontWeight: 600,
                      }}>
                        Tier {result.fieldSafety.tier}
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Allowed:</strong>
                      <span>{result.fieldSafety.allowed ? "✅ Yes" : "🛑 Blocked"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Realm:</strong>
                      <span style={{ fontWeight: 600 }}>{result.fieldSafety.realm}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Intensity:</strong>
                      <span>{result.fieldSafety.intensity}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Field Work Safe:</strong>
                      <span>{result.fieldSafety.fieldWorkSafe ? "✅" : "❌"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Deep Work:</strong>
                      <span>{result.fieldSafety.deepWorkRecommended ? "✅ Recommended" : "❌ Not Recommended"}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.05)", borderRadius: 8, fontSize: 13 }}>
                    <strong>Reasoning:</strong> {result.fieldSafety.reasoning}
                  </div>
                  {result.fieldSafety.message && (
                    <div style={{ marginTop: 12, padding: 12, background: "rgba(251, 191, 36, 0.1)", borderRadius: 8, fontSize: 13 }}>
                      <strong>Mythic Message:</strong>
                      <div style={{ marginTop: 6 }}>{result.fieldSafety.message.substring(0, 200)}...</div>
                    </div>
                  )}
                </div>
              )}

              {/* Cognitive Profile */}
              {result.profile && (
                <div style={{ padding: 16, background: "rgba(0,0,0,0.03)", borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
                    🧠 Cognitive Profile
                  </div>
                  <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Rolling Average:</strong>
                      <span style={{ fontWeight: 600 }}>{result.profile.avgLevel.toFixed(2)}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Current Level:</strong>
                      <span>{result.profile.currentLevel}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Stability:</strong>
                      <span>{result.profile.stability}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Spiritual Bypassing:</strong>
                      <span style={{
                        color: result.profile.bypassing.spiritual > 0.4 ? "#ef4444" :
                               result.profile.bypassing.spiritual > 0.25 ? "#f59e0b" : "#22c55e",
                        fontWeight: 600,
                      }}>
                        {(result.profile.bypassing.spiritual * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Intellectual Bypassing:</strong>
                      <span style={{
                        color: result.profile.bypassing.intellectual > 0.4 ? "#ef4444" :
                               result.profile.bypassing.intellectual > 0.25 ? "#f59e0b" : "#22c55e",
                        fontWeight: 600,
                      }}>
                        {(result.profile.bypassing.intellectual * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bloom Detection */}
              {result.bloom && (
                <div style={{ padding: 16, background: "rgba(0,0,0,0.03)", borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>
                    🌸 Bloom Detection
                  </div>
                  <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Level:</strong>
                      <span>{result.bloom.level}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Numeric:</strong>
                      <span>{result.bloom.numericLevel}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
                      <strong>Score:</strong>
                      <span>{result.bloom.score.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.05)", borderRadius: 8, fontSize: 13 }}>
                    <strong>Rationale:</strong> {result.bloom.rationale}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details>
                <summary style={{ cursor: "pointer", fontWeight: 600, padding: 8 }}>
                  Show Raw JSON
                </summary>
                <pre
                  style={{
                    marginTop: 8,
                    padding: 16,
                    borderRadius: 12,
                    overflow: "auto",
                    background: "rgba(0,0,0,0.06)",
                    fontSize: 12,
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div style={{ padding: 32, textAlign: "center", opacity: 0.5, fontSize: 14 }}>
              Run a check to see results
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
