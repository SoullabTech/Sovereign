/** LISTEN-01 · the shipped performer catalog.
 *
 * EMPTY, by founder direction: no performer is named, invited or shown until the feature has been
 * beta-tested safely and a named human signer has approved an entry (see performerCatalog.ts for
 * the gate every entry must pass). tests/listening/listen79_performer_catalog.test.mjs asserts this
 * list is empty in slice 1 on purpose — changing it is a signer act and a deliberate test edit,
 * not a code convenience. Claude and JARVIS prepare entries and never sign them.
 */
export const PERFORMER_CATALOG: ReadonlyArray<unknown> = [];
