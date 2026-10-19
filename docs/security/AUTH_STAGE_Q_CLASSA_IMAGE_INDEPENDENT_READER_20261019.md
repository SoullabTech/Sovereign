# Stage Q Class A — independent production-shaped image reader witness
Date: 2026-10-19
Disposition: ISOLATED BUILD/READER PASS; RELEASE HOLD

- Frozen **application** source: `9ed5d83ba856b4e8c4940ef7f928447ae28c3837` (PR #1883).
- Image-review **workflow** commit: `77740ece129314cc7a0cd3d52706bcf4e73f5822` (draft PR #1887).
- GitHub Actions run `39314980454`: all six workflows completed success, including the two separate jobs below.
- Builder job `118274972603`: full unchanged production Dockerfile built for Linux amd64 with CI-review-only lane; image archive, SHA-256 record and two-day private artifact uploaded.
- Reader job `118281842300`: a fresh runner downloaded the archive, independently verified SHA-256, image ID, frozen source, architecture, lane and non-release markers, loaded the image, booted it with Docker `--network none`, no published ports, and observed actual compiled `/signin` HTTP 200. Independent receipt and labeled container cleanup succeeded.
- Actual image ID: `sha256:ee8ea174a90dc7465921a3cd6db801321cfe82a0f35633d94ed8371eba63b6e9`.
- Archive SHA-256: `1231d686322eed99d6b7d97b75f9dd0d8e8cab7692fd42acd2e02cef6ca102f2`.
- Private archive artifact: `stageq-classa-1883-private-image`, artifact ID `12218786776`, size 1,405,373,761 bytes.
- Separately produced private reader receipt: `stageq-classa-1883-independent-reader-receipt`, artifact ID `12218173404`, size 444 bytes.
- Both artifacts have a configured **two-day retention**, so this is time-bounded custody; a later production promotion would need fresh artifact custody and exact release authorization.

**Boundaries:** image integrity and compiled sign-in doorway are attested; there was **no live member credential authentication inside this networkless image**, no production or staged instance, no public trusted TLS, no macOS Safari, and no independent human security review. The 36/36 previous Caddy/WebKit/SQL acceptance used a reduced fictional Next fixture; it cannot be silently counted as full image browser acceptance. No registry push, merge or deployment occurred.

**Release state: HOLD.** Production, staging, protected canonical, native clients, privacy/recovery gates and real-member beta remain unchanged.