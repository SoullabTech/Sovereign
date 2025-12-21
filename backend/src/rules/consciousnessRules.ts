// backend

export const DEFAULT_CONSCIOUSNESS_RULES = `
; MAIA Consciousness Rules - Spiralogic Elemental Routing System
; 8 default rules covering: Shadow work, Vision grounding, Cognitive loops,
; Foundation/grounding, Meta-reflection, Numinous entry, Safety escalation, Ventral regulation

(rule safety-escalation-hrv-drop
  (priority 100)
  (when (> biomarkers.hrv_drop 30))
  (infer (facet safety) (mode critical) (confidence 0.9))
  (do (route SafetyAgent)
      (practice "Your nervous system needs support. Let's pause and regulate together: soft belly breathing, 6 counts in, 6 counts out.")
      (tag "safety")
      (flag "critical_override")))

(rule earth1-foundation-grounding
  (priority 60)
  (when (or (contains input.text "grounding")
            (contains input.text "stability")
            (and (< biomarkers.hrv_drop 0) (== biomarkers.energy_level "low"))))
  (infer (facet earth1) (mode foundation) (confidence 0.2))
  (do (route SomaticAgent)
      (practice "Feet on floor. Three deep breaths. Notice your center of gravity. You are here, held by the earth.")
      (tag "earth1")
      (flag "grounding")))

(rule ventral-regulation
  (priority 55)
  (when (and (< biomarkers.sentiment_score -0.3)
             (or (> biomarkers.arousal_score 0.6) (== biomarkers.energy_level "high"))))
  (infer (facet ventral) (mode regulation) (confidence 0.25))
  (do (route SomaticAgent)
      (practice "Vagus activation: gentle humming for 30 seconds, then soft gaze at horizon or friendly face.")
      (tag "ventral")
      (flag "nervous_system_support")))

(rule water2-shadow-gate
  (priority 50)
  (when (and (> biomarkers.hrv_drop 15)
             (in symbolic.theme (list "betrayal" "abandonment" "grief"))
             (or (contains input.text "stuck") (contains input.text "can't stop thinking"))))
  (infer (facet water2) (mode shadow) (confidence 0.2))
  (do (route ShadowAgent)
      (practice "Containment + titration: name the feeling, locate it in the body, soften edges, 90 seconds only, then stop.")
      (tag "water2")
      (flag "gentle_depth")))

(rule fire3-vision-overheat
  (priority 40)
  (when (and (contains input.text "big vision")
             (or (> biomarkers.resting_hr 15) (> biomarkers.arousal_score 0.7))))
  (infer (facet fire3) (mode "overheat") (confidence 0.15))
  (do (route GuideAgent)
      (practice "Ground the vision: 3 concrete next actions, 1 constraint, 1 rest boundary.")
      (tag "fire3")))

(rule air2-meta-reflection
  (priority 35)
  (when (or (contains input.text "pattern")
            (contains input.text "framework")
            (and (> biomarkers.emotional_clarity 0.7) (contains input.text "notice"))))
  (infer (facet air2) (mode meta) (confidence 0.2))
  (do (route ReflectionAgent)
      (practice "What patterns are you noticing? Name three connections between this moment and your larger story.")
      (tag "air2")
      (flag "meta_awareness")))

(rule air2-rumination-loop
  (priority 30)
  (when (and (contains input.text "what if")
             (contains input.text "keep replaying")))
  (infer (facet air2) (mode "loop") (confidence 0.15))
  (do (route CBTAgent)
      (practice "Thought label + reframe: identify distortion, generate 2 alternative interpretations.")
      (tag "air2")))

(rule aether-numinous-entry
  (priority 25)
  (when (or (contains input.text "numinous")
            (contains input.text "archetypal")
            (contains input.text "synchronicity")
            (contains input.text "soul")))
  (infer (facet aether) (mode sacred) (confidence 0.3))
  (do (route MysticAgent)
      (practice "What wants to be known through this experience? Open to the mystery without grasping.")
      (tag "aether")
      (flag "sacred_awareness")))
`;
