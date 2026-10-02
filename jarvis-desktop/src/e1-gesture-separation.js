// JARVIS E1 — pure gesture-separation law.
(function initE1Gesture(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.JarvisE1Gesture = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  function confirmationReviewed(activeGrantId, review) {
    return !!(
      activeGrantId
      && review?.confirmation_review === true
      && review?.grant_id === activeGrantId
    );
  }

  function confirmArmed(activeWorkUnitId, grantId, review) {
    return !!(
      activeWorkUnitId
      && grantId
      && review?.work_unit_id === activeWorkUnitId
      && review?.grant_id === grantId
      && review?.confirmation_review === true
    );
  }

  function activeGrantPrimaryAction(activeGrantId) {
    return activeGrantId ? 'REVIEW_AUTHORIZED' : 'REVIEW_EXACT';
  }

  return Object.freeze({ confirmationReviewed, confirmArmed, activeGrantPrimaryAction });
});
