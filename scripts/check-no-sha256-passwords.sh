#!/bin/bash
#
# Guardrail: Ensure no SHA256 password hashing in auth surface area
#
# Run this in CI or pre-commit to prevent accidental SHA256 usage for passwords.
# The only approved password hashing entrypoint is lib/auth/passwordUtils.ts
#

set -e

# Directories where createHash('sha256') is NEVER allowed for passwords
AUTH_DIRECTORIES=(
  "app/api/members"
  "app/api/admin"
  "lib/auth"
)

# Files that ARE allowed to use SHA256 (the approved entrypoint + tests)
ALLOWED_FILES=(
  "lib/auth/passwordUtils.ts"
  "lib/auth/__tests__"
)

FOUND_VIOLATIONS=0

for dir in "${AUTH_DIRECTORIES[@]}"; do
  if [ ! -d "$dir" ]; then
    continue
  fi

  # Find all .ts files with createHash('sha256')
  while IFS= read -r file; do
    [ -z "$file" ] && continue

    # Check if file is in allowed list
    ALLOWED=0
    for allowed in "${ALLOWED_FILES[@]}"; do
      if [[ "$file" == *"$allowed"* ]]; then
        ALLOWED=1
        break
      fi
    done

    if [ $ALLOWED -eq 0 ]; then
      echo "ERROR: SHA256 found in $file"
      grep -n "createHash('sha256')" "$file" | head -3
      FOUND_VIOLATIONS=1
    fi
  done < <(grep -rl "createHash('sha256')" "$dir" --include="*.ts" 2>/dev/null || true)

  # Also check for local hashPassword functions (should import from passwordUtils)
  while IFS= read -r file; do
    [ -z "$file" ] && continue

    # Check if file is in allowed list
    ALLOWED=0
    for allowed in "${ALLOWED_FILES[@]}"; do
      if [[ "$file" == *"$allowed"* ]]; then
        ALLOWED=1
        break
      fi
    done

    if [ $ALLOWED -eq 0 ]; then
      echo "ERROR: Local hashPassword function in $file"
      grep -n "function hashPassword" "$file" | head -3
      FOUND_VIOLATIONS=1
    fi
  done < <(grep -rl "function hashPassword" "$dir" --include="*.ts" 2>/dev/null || true)
done

if [ $FOUND_VIOLATIONS -eq 1 ]; then
  echo ""
  echo "FAILED: SHA256 password violations found"
  echo "All password operations must use lib/auth/passwordUtils.ts (bcrypt)"
  exit 1
fi

echo "OK: No SHA256 password violations in auth surface area"
exit 0
