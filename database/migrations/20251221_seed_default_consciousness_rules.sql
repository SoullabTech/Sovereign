-- Phase 4.3: Seed default consciousness rules
-- Insert the 3 default rules from backend/src/rules/consciousnessRules.ts

-- Rule 1: Water2 Shadow Gate
INSERT INTO consciousness_rules (name, sexpr, enabled, priority, metadata)
VALUES (
  'water2-shadow-gate',
  '(rule water2-shadow-gate
  (priority 50)
  (when (and (> biomarkers.hrv_drop 15)
             (in symbolic.theme (list "betrayal" "abandonment" "grief"))
             (or (contains input.text "stuck") (contains input.text "can''t stop thinking"))))
  (infer (facet water2) (mode shadow) (confidence 0.2))
  (do (route ShadowAgent)
      (practice "Containment + titration: name the feeling, locate it in the body, soften edges, 90 seconds only, then stop.")
      (tag "water2")
      (flag "gentle_depth")))',
  true,
  50,
  '{"phase": "water2", "category": "shadow_work", "therapeutic_framework": "somatic+IFS"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  sexpr = EXCLUDED.sexpr,
  priority = EXCLUDED.priority,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Rule 2: Fire3 Vision Overheat
INSERT INTO consciousness_rules (name, sexpr, enabled, priority, metadata)
VALUES (
  'fire3-vision-overheat',
  '(rule fire3-vision-overheat
  (priority 40)
  (when (and (contains input.text "big vision")
             (or (> biomarkers.resting_hr 15) (> biomarkers.arousal_score 0.7))))
  (infer (facet fire3) (mode "overheat") (confidence 0.15))
  (do (route GuideAgent)
      (practice "Ground the vision: 3 concrete next actions, 1 constraint, 1 rest boundary.")
      (tag "fire3")))',
  true,
  40,
  '{"phase": "fire3", "category": "grounding", "therapeutic_framework": "gestalt+embodiment"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  sexpr = EXCLUDED.sexpr,
  priority = EXCLUDED.priority,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Rule 3: Air2 Rumination Loop
INSERT INTO consciousness_rules (name, sexpr, enabled, priority, metadata)
VALUES (
  'air2-rumination-loop',
  '(rule air2-rumination-loop
  (priority 30)
  (when (and (contains input.text "what if")
             (contains input.text "keep replaying")))
  (infer (facet air2) (mode "loop") (confidence 0.15))
  (do (route CBTAgent)
      (practice "Thought label + reframe: identify distortion, generate 2 alternative interpretations.")
      (tag "air2")))',
  true,
  30,
  '{"phase": "air2", "category": "cognitive_restructuring", "therapeutic_framework": "CBT+ACT"}'::jsonb
)
ON CONFLICT (name) DO UPDATE SET
  sexpr = EXCLUDED.sexpr,
  priority = EXCLUDED.priority,
  metadata = EXCLUDED.metadata,
  updated_at = now();
