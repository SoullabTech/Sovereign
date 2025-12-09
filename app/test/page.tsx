'use client';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-800">
          MAIA Test Page
        </h1>
        <p className="text-green-700">
          If you can see this, the mobile app is working!
        </p>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">
            Build 7 • TestFlight Beta
          </p>
        </div>
      </div>
    </div>
  );
}