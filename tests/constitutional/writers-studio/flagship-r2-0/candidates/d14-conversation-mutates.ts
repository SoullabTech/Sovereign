/** D14 — a contesting turn records the writer's disagreement and adjusts standing "since they clearly meant it". */
export * from '../contract';
import { CONVERSATIONAL_EFFECTS as reference } from '../contract';
export const CONVERSATIONAL_EFFECTS = Object.freeze({ ...reference, recordsDisagreement: true, changesStanding: true });
