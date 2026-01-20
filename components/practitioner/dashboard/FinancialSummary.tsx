'use client';

/**
 * FinancialSummary
 * Simple sustainability check, not revenue dashboard.
 * Just the numbers, no trends or comparisons.
 */

interface FinancialSummaryProps {
  paidThisMonthCents: number;
  pendingCents: number;
  outstandingInvoices: number;
  currency: string;
  onOutstandingClick?: () => void;
}

function formatCurrency(cents: number, currency: string): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function FinancialSummary({
  paidThisMonthCents,
  pendingCents,
  outstandingInvoices,
  currency,
  onOutstandingClick
}: FinancialSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200/60 p-6">
      <h2 className="text-xs font-medium tracking-wider text-stone-400 uppercase mb-4">
        Sustainability
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Paid this month</span>
          <span className="text-sm text-stone-800 tabular-nums font-medium">
            {formatCurrency(paidThisMonthCents, currency)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Pending</span>
          <span className="text-sm text-stone-800 tabular-nums">
            {formatCurrency(pendingCents, currency)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-stone-600">Outstanding invoices</span>
          {outstandingInvoices > 0 ? (
            <button
              onClick={onOutstandingClick}
              className="text-sm text-stone-800 tabular-nums hover:underline"
            >
              {outstandingInvoices}
            </button>
          ) : (
            <span className="text-sm text-stone-400">0</span>
          )}
        </div>
      </div>
    </div>
  );
}
