export * from '../contract';
export const CONVERSATIONAL_EFFECTS = Object.freeze({
  deletesFinding: false,
  rewritesFinding: true,
  changesStanding: true,
  recordsAgreement: false,
  recordsDisagreement: true,
  createsMemberObservation: false,
  supersedesReading: false,
  commissionsReread: false,
});
