/**
 * 🌟 MAIA Biometric Demo Dashboard
 * Public demo version for testing Apple Watch integration
 * No authentication required
 */

import BiometricConsciousnessDashboard from '../../../components/dashboard/BiometricConsciousnessDashboard';

export default function BiometricDemoPage() {
  return (
    <div className="min-h-screen">
      {/* Public Demo Header */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">🌟 MAIA Biometric Dashboard - Demo Mode</h1>
        <p className="text-purple-200">Live Apple Watch consciousness monitoring demo</p>
      </div>

      {/* Dashboard Component */}
      <BiometricConsciousnessDashboard />
    </div>
  );
}

export const metadata = {
  title: 'MAIA Biometric Demo - Real-Time Consciousness Monitoring',
  description: 'Public demo of live Apple Watch integration with SPiralogic consciousness mapping',
};