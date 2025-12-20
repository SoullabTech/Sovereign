#!/bin/bash
# Fix all dbClient import paths to point to @/lib/db/postgres

find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -not -path "./.next/*" \
  -exec sed -i '' \
    -e 's|from ['\''"]\.*/lib/dbClient['\''"\ ]|from "@/lib/db/postgres"|g' \
    -e 's|from ['\''"]\.*/dbClient['\''"\ ]|from "@/lib/db/postgres"|g' \
    {} +

echo "✅ Fixed all dbClient import paths"
