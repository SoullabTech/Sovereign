'use client';

/**
 * Birth Data Input Form
 *
 * Sacred interface for entering birth information to calculate natal chart
 * Follows Spiral Journey philosophy: wonder over instruction
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Circle, MapPin, Clock, Calendar } from 'lucide-react';
import { MiniHoloflower } from '../holoflower/MiniHoloflower';

// Inline styles for placeholder text
const placeholderStyles = `
  #birthLocation::placeholder {
    color: #fb923c !important;
    opacity: 0.6 !important;
    font-weight: 300 !important;
  }
`;

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

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  loading?: boolean;
  isDayMode?: boolean;
}

export function BirthDataForm({ onSubmit, loading = false, isDayMode = false }: BirthDataFormProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Search for location using geocoding
  const searchLocation = async (query: string) => {
    if (query.length < 2) {
      setLocationResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use our backend geocoding API (handles multiple providers with fallbacks)
      const response = await fetch(
        `/api/astrology/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success) {
        console.log(`Location search results from ${data.provider}:`, data.data);
        setLocationResults(data.data);
      } else {
        console.error('Location search error:', data.error);
        setLocationResults([]);
        // Show user-friendly error if service is down
        if (response.status === 503) {
          alert('Location search is temporarily unavailable. Please try again in a moment.');
        }
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = async (location: any) => {
    console.log('Location selected:', location);

    // If this location doesn't have timezone info yet, fetch it
    if (!location.timezone) {
      setIsSearching(true);
      try {
        // Re-fetch just this location to get timezone
        const response = await fetch(
          `/api/astrology/geocode?q=${encodeURIComponent(location.display_name)}`
        );
        const data = await response.json();
        if (data.success && data.data[0]?.timezone) {
          location.timezone = data.data[0].timezone;
          location.utcOffset = data.data[0].utcOffset;
        }
      } catch (error) {
        console.error('Timezone detection error:', error);
      } finally {
        setIsSearching(false);
      }
    }

    setSelectedLocation(location);
    setLocationName(location.display_name);
    setLocationResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !selectedLocation) {
      alert('Please enter your birth date, time, and location');
      return;
    }

    onSubmit({
      date,
      time,
      location: {
        name: selectedLocation.display_name,
        lat: parseFloat(selectedLocation.lat),
        lng: parseFloat(selectedLocation.lon),
        timezone: selectedLocation.timezone || 'UTC', // Auto-detected timezone!
      },
      houseSystem: 'placidus', // Use Placidus house system (most popular)
    });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: placeholderStyles }} />
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto p-8 backdrop-blur-md transition-all duration-500 border"
        style={{
          backgroundColor: isDayMode ? 'rgba(228,220,200,0.85)' : 'rgba(12, 9, 7, 0.9)',
          borderColor: '#9B6B3C',
          boxShadow: isDayMode ? '0 4px 20px rgba(0,0,0,0.08)' : '0 0 40px rgba(0, 0, 0, 0.8)',
        }}
      >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-4"
        >
          <MiniHoloflower size={96} isDayMode={false} />
        </motion.div>
        <h2 className="text-2xl font-serif mb-2 tracking-wide transition-colors duration-500"
          style={{ fontWeight: 300, color: isDayMode ? '#C67A28' : '#D88A2D' }}>
          Your Cosmic Blueprint
        </h2>
        <p className="text-sm font-serif italic transition-colors duration-500"
          style={{ fontWeight: 300, color: isDayMode ? '#3D2E1F' : '#E7E2CF' }}>
          The cosmos remembers the moment you arrived
        </p>
      </div>

      <div className="space-y-6">
        {/* Birth Date */}
        <div>
          <label
            htmlFor="birthDate"
            className="flex items-center gap-2 text-sm mb-2"
            style={{ fontWeight: 300, color: '#fdba74' }}
          >
            <Calendar className="w-4 h-4" strokeWidth={1.5} style={{ color: '#fdba74' }} />
            Birth Date
          </label>
          <input
            id="birthDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-3 border transition-all duration-300 bg-black/40 border-orange-900/40 focus:border-orange-700/60 focus:outline-none focus:ring-1 focus:ring-orange-600/30"
            style={{ fontWeight: 300, color: '#fed7aa', colorScheme: 'dark' }}
          />
        </div>

        {/* Birth Time */}
        <div>
          <label
            htmlFor="birthTime"
            className="flex items-center gap-2 text-sm mb-2"
            style={{ fontWeight: 300, color: '#fdba74' }}
          >
            <Clock className="w-4 h-4" strokeWidth={1.5} style={{ color: '#fdba74' }} />
            Birth Time
          </label>
          <input
            id="birthTime"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full px-4 py-3 border transition-all duration-300 bg-black/40 border-orange-900/40 focus:border-orange-700/60 focus:outline-none focus:ring-1 focus:ring-orange-600/30"
            style={{ fontWeight: 300, color: '#fed7aa', colorScheme: 'dark' }}
          />
          <p className="text-xs mt-1 italic" style={{ fontWeight: 300, color: '#fb923c' }}>
            If unsure, use 12:00 noon
          </p>
        </div>

        {/* Birth Location */}
        <div className="relative">
          <label
            htmlFor="birthLocation"
            className="flex items-center gap-2 text-sm mb-2"
            style={{ fontWeight: 300, color: '#fed7aa' }}
          >
            <MapPin className="w-4 h-4" strokeWidth={1.5} style={{ color: '#fed7aa' }} />
            Birth Location
          </label>
          <input
            id="birthLocation"
            type="text"
            value={locationName}
            onChange={(e) => {
              setLocationName(e.target.value);
              setSelectedLocation(null); // Clear selection when typing
              searchLocation(e.target.value);
            }}
            placeholder="Type city name, then select from dropdown..."
            required
            className="w-full px-4 py-3 border transition-all duration-300 bg-black/40 border-orange-900/40 focus:border-orange-700/60 focus:outline-none focus:ring-1 focus:ring-orange-600/30"
            style={{ fontWeight: 300, color: '#fed7aa' }}
          />
          <p className="text-xs mt-1 italic" style={{ fontWeight: 300, color: '#fb923c', opacity: 0.8 }}>
            ↳ Start typing, then click a result from the dropdown
          </p>

          {/* Location Search Results */}
          {locationResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-10 w-full mt-2 border overflow-hidden bg-stone-900/95 border-orange-800/40 shadow-xl"
            >
              {locationResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(result)}
                  className="w-full px-4 py-3 text-left transition-colors duration-200 hover:bg-orange-950/50"
                  style={{ fontWeight: 300 }}
                >
                  <div className="text-sm" style={{ color: '#fef3c7', fontWeight: 400 }}>{result.display_name}</div>
                  <div className="text-xs mt-1" style={{ color: '#fde68a', fontWeight: 300 }}>
                    Lat: {parseFloat(result.lat).toFixed(4)}, Lon: {parseFloat(result.lon).toFixed(4)}
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {isSearching && (
            <div className="text-xs mt-1" style={{ fontWeight: 300, color: '#fb923c' }}>
              Searching locations...
            </div>
          )}

          {selectedLocation && (
            <div className="text-xs mt-2 px-3 py-2 border border-green-900/40 bg-green-950/30" style={{ fontWeight: 300, color: '#86efac' }}>
              ✓ Selected: {selectedLocation.display_name}
              {selectedLocation.timezone && (
                <div className="mt-1 text-emerald-300/80">
                  Timezone: {selectedLocation.timezone} (UTC{selectedLocation.utcOffset >= 0 ? '+' : ''}{selectedLocation.utcOffset})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !date || !time || !selectedLocation}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.99 }}
          onClick={() => console.log('Button state:', { loading, date, time, selectedLocation })}
          className={`w-full py-4 font-serif text-lg transition-all duration-300 border
            ${loading || !date || !time || !selectedLocation
              ? 'opacity-40 cursor-not-allowed bg-orange-950/20 border-orange-900/20'
              : 'bg-gradient-to-r from-orange-900/60 to-orange-800/60 border-orange-700/50 hover:from-orange-800/70 hover:to-orange-700/70 hover:border-orange-600/60'
            }`}
          style={{
            fontWeight: 300,
            color: '#fed7aa',
            boxShadow: loading ? 'none' : '0 0 20px rgba(217, 119, 6, 0.2)',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Circle className="w-5 h-5" strokeWidth={1.5} />
              </motion.div>
              Calculating your cosmic blueprint...
            </span>
          ) : (
            'Calculate My Birth Chart'
          )}
        </motion.button>
      </div>

      <p className="text-center text-xs mt-6 italic" style={{ fontWeight: 300, color: '#fb923c' }}>
        Your birth chart will be calculated with Time Passages-level precision
      </p>
    </motion.form>
    </>
  );
}
