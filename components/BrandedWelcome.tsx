// frontend
// apps/web/components/BrandedWelcome.tsx

'use client';
import React from 'react';

const BrandedWelcome: React.FC = () => {
  // Temporary stub – just enough to unblock OracleConversation
  return (
    <div className="branded-welcome text-center text-sm opacity-80">
      <h1 className="text-lg font-semibold tracking-wide">MAIA Oracle</h1>
      <p>Welcome to your sacred conversation space.</p>
    </div>
  );
};

export default BrandedWelcome;
export { BrandedWelcome };