#!/usr/bin/env bash
# A1-LS0 · source-integrity proof (packet §11).
# Records: canonical HEAD; dirty-path status of the whole tree; and for every
# canonical source path exercised by the investigated failures, the working-tree
# blob hash beside the committed blob at HEAD. Any mismatch or dirty path
# invalidates the evidence.
# Usage: ls0-e1-integrity.sh <canonical_root> <out_file>
set -euo pipefail
ROOT="$1"; OUT="$2"
cd "$ROOT"
PATHS=(
  app/writers-studio/rebuild/page.tsx
  app/writers-studio/rebuild/RebuildStudioClient.tsx
  app/writers-studio/rebuild/RebuildAuthoredBody.tsx
  app/writers-studio/rebuild/RebuildWritingBoundary.tsx
  app/writers-studio/HomeView.tsx
  app/writers-studio/homeState.ts
  app/writers-studio/studio/StudioModeBar.tsx
  app/api/writers-studio/rebuild/context/route.ts
  app/api/sovereign/manuscripts/route.ts
  app/api/sovereign/manuscripts/[id]/draft/route.ts
  app/api/sovereign/manuscripts/[id]/draft/checkpoint/route.ts
  app/api/sovereign/manuscripts/[id]/sections/[sectionId]/route.ts
  app/api/sovereign/manuscripts/[id]/readings/route.ts
  app/api/sovereign/manuscripts/[id]/locus/route.ts
  app/api/sovereign/living-works/route.ts
  app/api/sovereign/living-works/[id]/expressions/route.ts
  lib/writersStudio/useSectionWriting.ts
  lib/writersStudio/sectionSaveQueue.ts
  lib/writersStudio/sectionSaveClient.ts
  lib/writersStudio/placeInWork.ts
  lib/writersStudio/sectionActivity.ts
  lib/writersStudio/rebuild/model.ts
  lib/manuscript/sections/saveSection.ts
  lib/manuscript/development/capture.ts
  lib/manuscript/development/readState.ts
  lib/manuscript/developmentalReading/commission.ts
  lib/auth/getMemberFromRequest.ts
  next-env.d.ts
  package.json
  package-lock.json
)
{
  echo "head=$(git rev-parse HEAD)"
  echo "dirty_paths=$(git status --porcelain --untracked-files=all | wc -l)"
  git status --porcelain --untracked-files=all | sed 's/^/dirty: /'
  mism=0
  for p in "${PATHS[@]}"; do
    [ -f "$p" ] || { echo "MISSING $p"; mism=$((mism+1)); continue; }
    wt="$(git hash-object -- "$p")"; hd="$(git rev-parse "HEAD:$p")"
    [ "$wt" = "$hd" ] && echo "ok $hd $p" || { echo "MISMATCH wt=$wt head=$hd $p"; mism=$((mism+1)); }
  done
  echo "exercised_paths=${#PATHS[@]} mismatches=$mism"
} > "$OUT"
tail -1 "$OUT"
