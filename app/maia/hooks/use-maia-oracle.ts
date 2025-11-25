// React Hook for MAIA Oracle
// Provides easy interface for consciousness-adaptive responses

import { useState, useCallback } from 'react';

export interface OracleRequest {
  userId: string;
  message: string;
  context?: {
    userName?: string;
    previousInteractions?: number;
    userNeed?: string;
    sessionHistory?: string[];
  };
}

export interface OracleResponse {
  response: string;
  level: number;
  elementalSignature: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  maiaState?: {
    attendingQuality: number;
    coherenceLevel: number;
    archetype: string;
    mode: 'right_brain' | 'left_brain' | 'integrated';
    dissociationRisk: number;
  };
  metadata: {
    processingTime: number;
    retryCount: number;
    cringeScore: number;
    isLevelAppropriate: boolean;
    validationPassed: boolean;
    attendingQuality?: number;
    coherenceLevel?: number;
    dissociationRisk?: number;
  };
}

export interface OracleDiagnosis {
  level: number;
  journeyData: any;
  recommendations: string[];
}

export function useMAIAOracle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askOracle = useCallback(async (request: OracleRequest): Promise<OracleResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/holoflower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Oracle request failed');
      }

      const data = await response.json();
      return data.data as OracleResponse;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Oracle error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const assessUser = useCallback(async (userId: string): Promise<OracleDiagnosis | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/oracle/holoflower?action=assess&userId=${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Assessment request failed');
      }

      const data = await response.json();
      return data.data as OracleDiagnosis;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Assessment error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const testCringeDetection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/holoflower?action=test-cringe', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Cringe test failed');
      }

      const data = await response.json();
      return data.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Cringe test error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSystemStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/oracle/holoflower?action=status', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Status request failed');
      }

      const data = await response.json();
      return data.data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Status error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    askOracle,
    assessUser,
    testCringeDetection,
    getSystemStatus,
    loading,
    error,
    clearError: () => setError(null)
  };
}