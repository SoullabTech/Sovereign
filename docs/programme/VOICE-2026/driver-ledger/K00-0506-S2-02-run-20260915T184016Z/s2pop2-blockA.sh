git -C /Users/soullab/MAIA-SOVEREIGN fetch origin claude/voice-2026-census-01
git -C /Users/soullab/MAIA-SOVEREIGN worktree add --detach /private/tmp/k0506-s2pop2-b198e2e37 b198e2e37058f2e059d986b4b148e224215f3ee3
cd /private/tmp/k0506-s2pop2-b198e2e37
HEAD_NOW="$(git rev-parse HEAD)"
echo "HEAD=$HEAD_NOW"
if [ "$HEAD_NOW" != "b198e2e37058f2e059d986b4b148e224215f3ee3" ]; then
  echo "STOP: wrong orchestration HEAD"
  exit 80
fi
[ -e node_modules ] || ln -s /Users/soullab/MAIA-SOVEREIGN/node_modules node_modules
git status --porcelain | grep -v '^?? node_modules$' > /private/tmp/s2w-tree-status.txt
if [ -s /private/tmp/s2w-tree-status.txt ]; then
  cat /private/tmp/s2w-tree-status.txt
  echo "STOP: tree not clean"
  exit 81
fi
echo "TREE_CLEAN=1"
npx jest --config jest.config.js __tests__/voice-kernel-00-source-gates.test.ts 2>&1 | tee /private/tmp/s2w-gate.txt | grep -E "Tests:"
grep -q "75 passed, 75 total" /private/tmp/s2w-gate.txt && echo "GATE_75_75=1" || { echo "STOP: gate not 75/75"; exit 82; }
FIX_SHA="$(shasum -a 256 scripts/witness/fixtures/k00-s2-nearend-997hz-180s.wav | cut -d' ' -f1)"
echo "FIXTURE_SHA=$FIX_SHA"
[ "$FIX_SHA" = "1a505b3d38a97b75cb935f85bd33deb889628322e558f74af9a5f05afbfbd00e" ] || { echo "STOP: fixture SHA differs from the pin"; exit 83; }
AF_SHA="$(shasum -a 256 /usr/bin/afplay | cut -d' ' -f1)"
echo "AFPLAY_SHA=$AF_SHA"
[ "$AF_SHA" = "88f3b577790877524edc79a20de8838a019c0ca723a0eaa4a8612a860317cabb" ] || { echo "STOP: /usr/bin/afplay SHA differs from the census pin"; exit 84; }
pgrep -x afplay > /private/tmp/s2w-afplay-before.txt && { cat /private/tmp/s2w-afplay-before.txt; echo "STOP: an afplay process already exists before the witness"; exit 85; } || echo "AFPLAY_PROCESSES_BEFORE=0"
echo "BLOCK_A_PASS=1"
