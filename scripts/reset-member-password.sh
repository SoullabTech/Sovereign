#!/bin/bash
# Reset a member's password without email
# Usage: ./scripts/reset-member-password.sh tester@example.com newpassword123

EMAIL="$1"
NEW_PASSWORD="$2"

if [ -z "$EMAIL" ] || [ -z "$NEW_PASSWORD" ]; then
  echo "Usage: $0 <email> <new_password>"
  exit 1
fi

if [ ${#NEW_PASSWORD} -lt 6 ]; then
  echo "Error: password must be at least 6 characters"
  exit 1
fi

# Hash via Node inside the container (uses same bcrypt as the app)
HASH=$(docker exec maia-sovereign node -e "
const bcrypt = require('bcrypt');
bcrypt.hash('$NEW_PASSWORD', 12).then(h => process.stdout.write(h));
")

if [ -z "$HASH" ]; then
  echo "Error: failed to generate hash"
  exit 1
fi

RESULT=$(docker exec maia-postgres psql -U soullab maia_consciousness -tAc \
  "UPDATE members SET password_hash = '$HASH' WHERE LOWER(email) = LOWER('$EMAIL') RETURNING email, username;")

if [ -z "$RESULT" ]; then
  echo "No member found with email: $EMAIL"
  exit 1
fi

echo "Password reset for: $RESULT"
echo "They can now sign in at soullab.life/begin with:"
echo "  Email:    $EMAIL"
echo "  Password: $NEW_PASSWORD"
