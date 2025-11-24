'use client';

// Consciousness Oracle Demo Component
// Shows the no-cringe, level-adaptive MAIA oracle in action

import { useState } from 'react';
import { useMAIAOracle, OracleResponse, OracleDiagnosis } from '@/hooks/use-maia-oracle';
import { SimpleHoloflower } from './holoflower-simple';

export function ConsciousnessOracleDemo() {
  const { askOracle, diagnoseUser, testCringeDetection, getSystemStatus, loading, error } = useMAIAOracle();
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('demo-user-123');
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [diagnosis, setDiagnosis] = useState<OracleDiagnosis | null>(null);
  const [cringeTest, setCringeTest] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [holoflowerStage, setHoloflowerStage] = useState<'dormant' | 'awakening' | 'processing' | 'blooming' | 'complete'>('dormant');

  const handleAskOracle = async () => {
    if (!message.trim()) return;

    // Animate holoflower through oracle stages
    setHoloflowerStage('awakening');
    setTimeout(() => setHoloflowerStage('processing'), 500);

    const result = await askOracle({
      userId,
      message,
      context: {
        userName: 'Demo User',
        previousInteractions: 0,
        userNeed: 'wisdom_seeking'
      }
    });

    if (result) {
      setHoloflowerStage('blooming');
      setTimeout(() => setHoloflowerStage('complete'), 1000);
      setTimeout(() => setHoloflowerStage('dormant'), 3000);
      setResponse(result);
    }
  };

  const handleDiagnose = async () => {
    const result = await diagnoseUser(userId);
    if (result) {
      setDiagnosis(result);
    }
  };

  const handleCringeTest = async () => {
    const result = await testCringeDetection();
    if (result) {
      setCringeTest(result);
    }
  };

  const handleStatusCheck = async () => {
    const result = await getSystemStatus();
    if (result) {
      setSystemStatus(result);
    }
  };

  const getLevelDescription = (level: number) => {
    const descriptions = {
      1: 'Asleep/Unconscious - New or not engaged',
      2: 'Awakening/Curious - Getting into it',
      3: 'Practicing/Developing - Learning the language',
      4: 'Integrated/Fluent - Living the work',
      5: 'Teaching/Transmuting - The wisdom holders'
    };
    return descriptions[level as keyof typeof descriptions] || 'Unknown level';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔥 MAIA Consciousness Oracle Demo
        </h1>
        <p className="text-gray-600">
          No-cringe, level-adaptive wisdom that meets you where you are
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Oracle Chat Interface */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Ask the Oracle</h2>

          {/* Holoflower Oracle Visualization */}
          <div className="flex-shrink-0">
            <SimpleHoloflower
              stage={holoflowerStage}
              consciousnessLevel={response?.level}
              elementalSignature={response?.elementalSignature}
              cringeScore={response?.metadata?.cringeScore}
              size={120}
              className="transition-all duration-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter user ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Ask your question or share what's on your mind..."
            />
          </div>

          <button
            onClick={handleAskOracle}
            disabled={loading || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md"
          >
            {loading ? 'Oracle thinking...' : 'Ask Oracle'}
          </button>
        </div>

        {response && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">Oracle Response</h3>
              <div className="text-sm text-gray-600">
                Level {response.level}: {getLevelDescription(response.level)}
              </div>
            </div>

            <div className="bg-white rounded p-4 mb-4">
              <p className="text-gray-800">{response.response}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-red-600">Fire</div>
                <div>{response.elementalSignature.fire}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-600">Water</div>
                <div>{response.elementalSignature.water}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-green-600">Earth</div>
                <div>{response.elementalSignature.earth}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-yellow-600">Air</div>
                <div>{response.elementalSignature.air}/10</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">Aether</div>
                <div>{response.elementalSignature.aether}/10</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Processing: {response.metadata.processingTime}ms |
              Retries: {response.metadata.retryCount} |
              Cringe Score: {response.metadata.cringeScore}/10 |
              Valid: {response.metadata.validationPassed ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>

      {/* Diagnostic Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Diagnosis */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Diagnosis</h2>
          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md mb-4"
          >
            {loading ? 'Diagnosing...' : 'Diagnose User'}
          </button>

          {diagnosis && (
            <div className="space-y-2">
              <p><strong>Level:</strong> {diagnosis.level}</p>
              <div>
                <strong>Recommendations:</strong>
                <ul className="list-disc list-inside text-sm mt-1">
                  {diagnosis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Cringe Detection Test */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Cringe Filter Test</h2>
          <button
            onClick={handleCringeTest}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md mb-4"
          >
            {loading ? 'Testing...' : 'Test Cringe Detection'}
          </button>

          {cringeTest && (
            <div className="space-y-2 text-xs">
              {cringeTest.results.map((result: any, i: number) => (
                <div key={i} className={`p-2 rounded ${result.hasCringe ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className="font-medium">Score: {result.score}/10</div>
                  {result.hasCringe && (
                    <div className="text-red-600 text-xs mt-1">
                      {result.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <button
            onClick={handleStatusCheck}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md mb-4"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>

          {systemStatus && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>AI Provider:</strong> {systemStatus.config.aiProvider}
              </div>
              <div>
                <strong>Model:</strong> {systemStatus.config.model}
              </div>
              <div>
                <strong>Components:</strong>
                <div className="ml-2">
                  {Object.entries(systemStatus.components).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value ? '✅' : '❌'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}