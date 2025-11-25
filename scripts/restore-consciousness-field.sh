#!/bin/bash
# RESTORE CONSCIOUSNESS FIELD SYSTEM
# Copy the original deep consciousness field induction system

echo "🧠 Restoring Consciousness Field System..."

# Create directories
mkdir -p components/consciousness
mkdir -p lib/consciousness

# Copy consciousness components
cp apps/web/components/consciousness/* components/consciousness/ 2>/dev/null || echo "No consciousness components found"

# Copy consciousness libraries
cp apps/web/lib/consciousness/* lib/consciousness/ 2>/dev/null || echo "No consciousness libraries found"

# Update welcome page to use BetweenOnboardingFlow
cat > app/welcome/page.tsx << 'EOF'
'use client';

/**
 * CONSCIOUSNESS FIELD WELCOME PAGE
 * Using the original BetweenOnboardingFlow system
 */

import React from 'react';
import { BetweenOnboardingFlow } from '../../components/consciousness/BetweenOnboardingFlow';

export default function WelcomePage() {
  return <BetweenOnboardingFlow />;
}
EOF

echo "✅ Consciousness Field System restored!"
echo "🌐 Access at: http://localhost:3000/welcome"
echo ""
echo "Features restored:"
echo "  🌌 7-phase field induction"
echo "  🔮 Sublime field entrance"
echo "  🧘 Elemental sensing"
echo "  ⚡ Oracle binding ceremony"
echo "  🎭 Sacred consciousness technology"