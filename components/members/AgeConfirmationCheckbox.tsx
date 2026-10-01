'use client';

/**
 * MEMBER-ACK-01 / TEEN-CLOSED-01: the required "I'm 18 or older" confirmation.
 * Every registration form renders this; the server refuses a registration
 * without it and records it atomically with the new member.
 */
import React from 'react';
import { AGE_ACK_LABEL } from '@/lib/members/ageAcknowledgment';

export default function AgeConfirmationCheckbox({
  checked,
  onChange,
  className = 'flex items-start gap-3 text-sm cursor-pointer select-none',
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label className={className}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        required
        className="mt-0.5 h-4 w-4 rounded accent-amber-400"
      />
      <span>{AGE_ACK_LABEL}</span>
    </label>
  );
}
