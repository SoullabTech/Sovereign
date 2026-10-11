/** Sanctuary upload hold: no trustworthy server-owned per-act privacy posture exists.
 * A client setting, cookie or request header cannot authorize persistence.
 * Keep the write path unreachable until separately governed authority is built.
 */
export function sourceUploadPostureAuthorized(): false {
  return false;
}

/** Reviewed transcription edits require their OWN crash-safe custody protocol.
 * This independent hold must not be lifted as a side effect of authorizing
 * new source ingestion. It remains false until separately governed.
 */
export function sourceReviewedEditAuthorized(): false {
  return false;
}
