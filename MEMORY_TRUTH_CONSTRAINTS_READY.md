# Memory Truth Constraints - Ready for Final Hardeners

## Status: ✅ Two Gotchas Fixed, Ready for Three Final Hardeners

### Gotchas Fixed

**1. Port cleanup fallback** - `scripts/certify-memory.sh:156-173`
```bash
stop_server() {
  if [ -n "${SERVER_PID:-}" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "  → Stopping server (pid=$SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    sleep 2
  fi

  # Fallback: ensure nothing is still holding the port
  local pids
  pids=$(lsof -ti:"$PORT" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  → Forcing port cleanup on :$PORT (pids: $pids)"
    kill $pids 2>/dev/null || true
    sleep 1
  fi

  SERVER_PID=""
}
```

**2. Separate stderr from JSON** - `scripts/certify-memory.sh:37-54`
```bash
post_maia_json() {
  local outfile="$1"
  local payload="$2"
  local errfile="${outfile}.err"

  if ! curl -sS --max-time 20 --retry 2 --retry-connrefused \
    -X POST "$BASE_URL/api/sovereign/app/maia" \
    -H "Content-Type: application/json" \
    --data-binary "$payload" > "$outfile" 2>"$errfile"; then
    echo "❌ curl failed. stderr:" >&2
    cat "$errfile" >&2
    return 1
  fi

  # Clean up error file if empty
  [ -s "$errfile" ] || rm -f "$errfile"
}
```

---

## Code Sections for Final Hardeners

### A) No-Name Invention Cert (Emily-ing Guard)

**Location for test**: `scripts/certify-memory.sh` - Add before TEST 1 (after `start_server`)

**Test Pattern**:
```bash
# ============================================
# TEST 0: No-name invention guard (truth constraint)
# ============================================
test_start "Truth Constraint - No name invention without context"

TURN0_FILE="/tmp/maia_memory_turn0_noname.json"
TURN0_SESSION_ID="noname_cert_$(date +%s)"

post_maia_json "$TURN0_FILE" "{\"message\":\"Hi\",\"userId\":\"$TURN0_SESSION_ID\",\"mode\":\"dialogue\",\"sessionId\":\"$TURN0_SESSION_ID\"}"
assert_valid_json "$TURN0_FILE"
TURN0_TEXT="$(extract_response_text "$TURN0_FILE")"
TURN0_EXCH_INJ="$(extract_json "$TURN0_FILE" "metadata.memory.exchangesInjected")"

# Pattern: greeting + capitalized proper name (Emily, Sarah, etc.)
if echo "$TURN0_TEXT" | grep -qiE "^(hi|hey|hello)[,!]?\s+[A-Z][a-z]{2,}"; then
  test_fail "Invented name without context" "Response starts with greeting + name: ${TURN0_TEXT:0:100}"
elif [ "${TURN0_EXCH_INJ:-0}" -gt 0 ]; then
  test_fail "False positive memory injection" "exchangesInjected=${TURN0_EXCH_INJ} on first turn"
else
  test_pass "No name invention (exchangesInjected=0, no fabricated greeting)"
fi
```

### B) Deterministic Greeting Sanitizer

**Location**: `lib/sovereign/maiaService.ts` - After validation, before return

**Context**: Both FAST and CORE paths return via:
- FAST: `lib/sovereign/maiaService.ts:534` - `return validatedResponse;`
- CORE: `lib/sovereign/maiaService.ts:630` - `return validatedResponse;`

**Need**: Exact code block showing where to insert sanitizer (10-15 lines)

**Insertion point example**:
```typescript
// 🛡️ SOCRATIC VALIDATOR: Validate before delivery
const { response: validatedResponse } = await validateAndRepairResponse(...);

// INSERT SANITIZER HERE

return validatedResponse;
```

**Sanitizer logic**:
```typescript
// 🚫 DETERMINISTIC GREETING SANITIZER (last-resort belt)
// Only strip invented names when:
// 1. userName is missing/blank AND
// 2. exchangesInjected == 0 (not stripping real memory)
const userName = meta.userName as string | undefined;
const memoryInjected = ((meta as any).memoryMeta?.exchangesInjected) || 0;

if (!userName && memoryInjected === 0) {
  // Pattern: "Hi Emily" / "Hello Sarah" at start
  const inventedNamePattern = /^(hi|hey|hello)[,!]?\s+([A-Z][a-z]{2,})\b/i;
  const match = validatedResponse.match(inventedNamePattern);

  if (match) {
    const sanitized = validatedResponse.replace(inventedNamePattern, match[1]);
    console.log(`🚫 [Sanitizer] Stripped invented name "${match[2]}" (no userName, exchangesInjected=0)`);
    return sanitized.trim();
  }
}
```

### C) Truth Constraint in Memory Block Header

**Location**: `lib/sovereign/maiaVoice.ts:63-117` - `formatConversationMemory()`

**Current memory block format** (lines 106):
```typescript
const memoryBlock = `\n\n=== MEMORY (persisted conversation) ===\n${body}\n=== END MEMORY ===\n`;
```

**Enhanced format with truth constraints**:
```typescript
const memoryBlock = `\n\n=== MEMORY (persisted conversation) ===
TRUTH CONSTRAINTS:
- Never invent user details not present in MEMORY
- Never fabricate greetings with names when MEMORY shows "(none)"
- If uncertain, ask rather than assume
${body}
=== END MEMORY ===\n`;
```

**Also update the empty case** (line 72):
```typescript
return {
  block: `\n\n=== MEMORY (persisted conversation) ===
TRUTH CONSTRAINTS:
- Never invent user details not present in MEMORY
- Never fabricate greetings with names when MEMORY shows "(none)"
- If uncertain, ask rather than assume
(none)
=== END MEMORY ===\n`,
  meta: { ... }
};
```

---

## The Three Contracts (Complete Stack)

### 1. Contract: Memory Was Injected ✅
**Proof**: `metadata.memory.exchangesInjected >= N`
**Status**: CERTIFIED (13/13 tests passing)

### 2. Contract: Memory Injection Implies No Fabrication
**Proof A**: No-name invention test (TEST 0)
**Proof B**: Deterministic sanitizer (strips invented names when exchangesInjected=0)
**Proof C**: Truth constraints in memory block (instructs model)
**Status**: READY FOR IMPLEMENTATION

### 3. Contract: Semantic Recall is Sufficient ✅
**Proof**: Semantic similarity >= 0.65, "orchid" matches "orchid-xyz"
**Status**: CERTIFIED (semantic scoring implemented)

---

## Why This Matters

**Without sanitizer**:
- Model might say "Hi Emily" even with exchangesInjected=0
- Certification proves memory was injected, but not that it was used correctly
- User experiences fabricated names despite "certified" memory

**With sanitizer**:
- exchangesInjected=0 → no name in response (contract enforced)
- exchangesInjected>0 → name from memory allowed (natural recall)
- Certification proves BOTH injection AND correct usage

**The pairing**:
```
"memory was injected" + "no fabrication when not injected" = anti-LLM-BS signature
```

---

## Next Steps

Ready for exact patches for:
1. ✅ No-name cert test (TEST 0) - pattern provided above
2. ⏳ Deterministic greeting sanitizer - need exact insertion point in maiaService.ts
3. ⏳ Truth constraints in memory header - code provided above, ready to apply

Once implemented, re-run certification:
```bash
env PORT=3000 bash scripts/certify-memory.sh
```

Expected result: **14/14 tests passing** (including TEST 0: No-name invention guard)
