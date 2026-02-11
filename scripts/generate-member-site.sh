#!/bin/bash
# ============================================================
# MAIA Member Site Generator
# ============================================================
# Creates a new member site from the template.
#
# Usage:
#   ./scripts/generate-member-site.sh "Kelly Nezat" kelly
#   ./scripts/generate-member-site.sh "Loralee" loralee
#
# This copies the template, replaces placeholders, and gives
# you a ready-to-customize site. Use maia-code to refine copy.
# ============================================================

set -euo pipefail

GREEN='\033[0;32m'
AMBER='\033[0;33m'
NC='\033[0m'

MEMBER_NAME="${1:?Usage: $0 \"Member Name\" slug}"
SLUG="${2:?Usage: $0 \"Member Name\" slug}"
DATE=$(date +%Y-%m-%d)

TEMPLATE_DIR="templates/member-site"
OUTPUT_DIR="sites/${SLUG}"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "Template not found at $TEMPLATE_DIR"
  exit 1
fi

if [[ -d "$OUTPUT_DIR" ]]; then
  echo -e "${AMBER}Site already exists at $OUTPUT_DIR${NC}"
  read -r "reply?Overwrite? (y/n) "
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  rm -rf "$OUTPUT_DIR"
fi

# Copy template
echo -e "${GREEN}Creating site for: ${MEMBER_NAME}${NC}"
mkdir -p "$OUTPUT_DIR"
cp -r "$TEMPLATE_DIR/"* "$OUTPUT_DIR/"

# Replace placeholders in CONTENT.json
if command -v gsed &>/dev/null; then
  SED_CMD="gsed"
else
  SED_CMD="sed"
fi

$SED_CMD -i'' -e "s/{{MEMBER_NAME}}/${MEMBER_NAME}/g" "$OUTPUT_DIR/CONTENT.json"
$SED_CMD -i'' -e "s/{{MEMBER_NAME}}/${MEMBER_NAME}/g" "$OUTPUT_DIR/SITE_SPEC.md"
$SED_CMD -i'' -e "s/{{THEME}}/soullab-sacred/g" "$OUTPUT_DIR/SITE_SPEC.md"
$SED_CMD -i'' -e "s/{{DATE}}/${DATE}/g" "$OUTPUT_DIR/SITE_SPEC.md"

echo ""
echo -e "${GREEN}Site generated at: ${OUTPUT_DIR}/${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit ${OUTPUT_DIR}/CONTENT.json with member's real copy"
echo "  2. Use maia-code to refine: 'Customize the site at sites/${SLUG} for a wellness practitioner'"
echo "  3. Preview locally or deploy"
echo ""
echo "Files:"
ls -la "$OUTPUT_DIR/"
