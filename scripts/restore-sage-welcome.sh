#!/bin/bash
# RESTORE SAGE/TEAL DAIMON WELCOME
# Copy the original sophisticated sage/teal onboarding experience

echo "🌟 Restoring SageTeal Daimon Welcome..."

# Create directory
mkdir -p components/onboarding

# Copy original component
cp apps/web/components/onboarding/SageTealDaimonWelcome.tsx components/onboarding/

# Update welcome page to use this component
cat > app/welcome/page.tsx << 'EOF'
'use client';

/**
 * ORIGINAL SAGE/TEAL WELCOME PAGE
 * Using the original SageTealDaimonWelcome component
 */

import React from 'react';
import SageTealDaimonWelcome from '../../components/onboarding/SageTealDaimonWelcome';

export default function WelcomePage() {
  return (
    <SageTealDaimonWelcome
      userName="Explorer"
      onComplete={() => {
        window.location.href = '/maia';
      }}
    />
  );
}
EOF

echo "✅ SageTeal Daimon Welcome restored!"
echo "🌐 Access at: http://localhost:3000/welcome"
echo ""
echo "Features restored:"
echo "  ✨ Sage-teal gradient background"
echo "  🔮 Sacred daimon philosophy"
echo "  🎭 Cycling elemental prompts"
echo "  📜 Cormorant Garamond typography"
echo "  🌸 Spinning holoflower animation"