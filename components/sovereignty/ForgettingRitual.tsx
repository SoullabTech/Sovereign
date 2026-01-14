'use client';

// Stub: Forgetting Ritual component
// TODO: Implement full data deletion ceremony

interface ForgettingRitualProps {
  userId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function ForgettingRitual({
  userId,
  onComplete,
  onCancel
}: ForgettingRitualProps) {
  return (
    <div className="p-6 text-center">
      <h3 className="text-lg font-medium mb-4">Data Deletion</h3>
      <p className="text-muted-foreground mb-6">
        This feature is coming soon. Contact support to request data deletion.
      </p>
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-muted rounded-lg"
      >
        Close
      </button>
    </div>
  );
}
