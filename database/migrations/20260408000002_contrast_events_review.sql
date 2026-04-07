-- Contrast Events — Review & Classification Fields
-- Keeps machine judgment and human judgment separate.
-- post_response_state_predicted = classifier output (offline)
-- post_response_state_reviewed = human reviewer label (ground truth)

ALTER TABLE contrast_events
  ADD COLUMN IF NOT EXISTS next_user_message text,
  ADD COLUMN IF NOT EXISTS primary_response text,
  ADD COLUMN IF NOT EXISTS latency_ms int,
  ADD COLUMN IF NOT EXISTS post_response_state_predicted text
    CHECK (post_response_state_predicted IN ('shift', 'continue', 'resist', 'unclear')),
  ADD COLUMN IF NOT EXISTS post_response_state_reviewed text
    CHECK (post_response_state_reviewed IN ('shift', 'continue', 'resist', 'unclear')),
  ADD COLUMN IF NOT EXISTS review_notes text;
