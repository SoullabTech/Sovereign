# Private illustrated Help assets

The repository is public. Do not commit the illustrated review PDFs or put them in `public/`: they include the author’s example writing and are intended for the invited pilot.

The protected guide endpoint expects these separately supplied, authorized deployment inputs:

- `handbook-review-0.9.pdf`
- `quick-start-review-0.9.pdf`

On the authorized build machine, copy the reviewed PDFs into this directory before the release build. The existing Next.js file trace then packages them into the standalone `data/writers-studio/help/` directory. This packaging was checked in the isolated Help witness. A checkout alone intentionally does not include the PDFs.

Before activating the pilot, repeat authenticated download checks on the deployed build for both files, and verify signed-out and non-cohort refusal. If an asset is missing, the endpoint returns unavailable; the local text topics and quick-start steps remain accessible. Missing private assets must not be disguised as an empty or successful PDF download.

These are Beta Review Edition 0.9 documents, not a claim that the final release has passed acceptance. Refresh their screenshots and instructions against the admitted pilot build before distribution.
