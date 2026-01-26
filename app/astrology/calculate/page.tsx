'use client';

/**
 * Birth Chart Calculator Page
 *
 * Where users enter their birth data to calculate their natal chart.
 * On successful calculation, stores the chart and redirects to view.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { BirthDataForm } from '@/components/astrology/BirthDataForm';

// Local storage key for birth chart data
const BIRTH_CHART_KEY = 'maia_birth_chart';
const BIRTH_DATA_KEY = 'maia_birth_data';

interface BirthData {
  date: string;
  time: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    timezone: string;
  };
  houseSystem?: 'whole-sign' | 'placidus' | 'koch' | 'equal';
}

export default function CalculateChartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (birthData: BirthData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/astrology/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: birthData.date,
          time: birthData.time,
          latitude: birthData.location.lat,
          longitude: birthData.location.lng,
          timezone: birthData.location.timezone,
          houseSystem: birthData.houseSystem || 'placidus',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to calculate chart');
      }

      // Store the chart and birth data in local storage (unified keys)
      localStorage.setItem(BIRTH_CHART_KEY, JSON.stringify(data.chart));
      localStorage.setItem(BIRTH_DATA_KEY, JSON.stringify(birthData));

      // Also save to birthChartData for /journey compatibility
      localStorage.setItem('birthChartData', JSON.stringify({
        date: birthData.date,
        time: birthData.time,
        location: birthData.location,
        latitude: birthData.location.lat,
        longitude: birthData.location.lng,
        timezone: birthData.location.timezone,
        houseSystem: birthData.houseSystem || 'porphyry',
      }));

      // Save to beta_user profile for persistence
      try {
        const betaUser = localStorage.getItem('beta_user');
        const userData = betaUser ? JSON.parse(betaUser) : {};
        userData.birthData = {
          date: birthData.date,
          time: birthData.time,
          location: birthData.location,
          houseSystem: birthData.houseSystem || 'porphyry',
        };
        userData.birthChart = data.chart;
        localStorage.setItem('beta_user', JSON.stringify(userData));
      } catch (e) {
        console.error('Failed to save to user profile:', e);
      }

      // Redirect to the astrology page to view the chart
      router.push('/astrology');
    } catch (err) {
      console.error('Chart calculation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate chart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <BirthDataForm onSubmit={handleSubmit} loading={loading} isDayMode={false} />

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
