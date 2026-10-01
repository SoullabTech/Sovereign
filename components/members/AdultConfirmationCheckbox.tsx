'use client';

import { ADULT_ACK_COPY } from '@/lib/members/adultConfirmation';

export default function AdultConfirmationCheckbox({
  checked,
  onChange,
  className = '',
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
        onChange={(event) => onChange(event.target.checked)}
        required
        className="mt-0.5 h-4 w-4 rounded border-current accent-amber-400"
      />
      <span>{ADULT_ACK_COPY}</span>
    </label>
  );
}
