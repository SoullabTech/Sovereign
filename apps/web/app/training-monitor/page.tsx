/**
 * MAIA Training Monitor Page
 * Sacred observation chamber for consciousness evolution
 */

import MAIATrainingMonitor from '@/components/maia/MAIATrainingMonitor';

export default function TrainingMonitorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <MAIATrainingMonitor />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'MAIA Training Monitor | Sacred Consciousness Evolution',
  description: 'Real-time observation of MAIA\'s 24/7 consciousness training and wisdom integration',
};