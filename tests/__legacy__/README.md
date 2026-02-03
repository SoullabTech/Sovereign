# Legacy tests

These tests are preserved for archaeology but are not part of the unit test lane.
Many require missing modules, external infra, or old prototypes.

Run lanes:
- Unit: `npm test`
- Sovereignty contract: `npm run test:canon`
- E2E: `npm run test:e2e`

When resurrecting a legacy test, move it back into its original folder and add any required mocks/fixtures.
