// backend

export const DEFAULT_CONSCIOUSNESS_RULES = `
; Example rules (edit freely). Multiple (rule ...) forms supported.

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

(rule air2-rumination-loop
  (priority 30)
  (when (and (contains input.text "what if")
             (contains input.text "keep replaying")))
  (infer (facet air2) (mode "loop") (confidence 0.15))
  (do (route CBTAgent)
      (practice "Thought label + reframe: identify distortion, generate 2 alternative interpretations.")
      (tag "air2")))
`;
