'use client';

/**
 * Birth Chart Calculator - Compact Corner Widget
 *
 * A collapsible birth data entry widget for the upper right corner.
 * Calculates birth chart and populates all astrological pages:
 * - /journey (interactive map)
 * - /astrology (blueprint)
 * - Settings > Birth Chart
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { apiFetch, apiUrl } from '@/lib/http/apiBase';

interface BirthData {
  date: string;
  time: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    timezone: string;
  };
  houseSystem?: string;
}

interface BirthChartCalculatorProps {
  onCalculate?: (data: BirthData) => void;
  isDayMode?: boolean;
}

export function BirthChartCalculator({ onCalculate, isDayMode = false }: BirthChartCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [locationName, setLocationName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing birth data on mount
  useEffect(() => {
    const loadExistingData = () => {
      // Check birthChartData localStorage
      const savedData = localStorage.getItem('birthChartData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.date && !data.isExample) {
            setDate(data.date);
            setTime(data.time || '12:00');
            if (data.location) {
              setLocationName(data.location.name || '');
              setSelectedLocation({
                display_name: data.location.name,
                lat: data.location.lat,
                lon: data.location.lng,
                timezone: data.location.timezone
              });
            }
            setHasExistingData(true);
            return;
          }
        } catch (e) {
          console.error('Error loading birth data:', e);
        }
      }

      // Check beta_user localStorage
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        try {
          const userData = JSON.parse(betaUser);
          if (userData.birthData?.date && !userData.birthData.isExample) {
            setDate(userData.birthData.date);
            setTime(userData.birthData.time?.substring(0, 5) || '12:00');
            if (userData.birthData.location) {
              setLocationName(userData.birthData.location.name || '');
              setSelectedLocation({
                display_name: userData.birthData.location.name,
                lat: userData.birthData.location.lat,
                lon: userData.birthData.location.lng,
                timezone: userData.birthData.location.timezone
              });
            }
            setHasExistingData(true);
          }
        } catch (e) {
          console.error('Error loading user birth data:', e);
        }
      }
    };

    loadExistingData();
  }, []);

  // Debounced location search
  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setLocationResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiFetch(
        `/api/astrology/geocode?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success && data.data?.length > 0) {
        setLocationResults(data.data);
      } else {
        setLocationResults([]);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setLocationResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 3 && !selectedLocation) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocation(searchQuery);
      }, 300);
    } else {
      setLocationResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedLocation, searchLocation]);

  const handleLocationSelect = async (location: any) => {
    // Fetch timezone if not present
    if (!location.timezone) {
      setIsSearching(true);
      try {
        const response = await apiFetch(
          `/api/astrology/geocode?q=${encodeURIComponent(location.display_name)}`
        );
        const data = await response.json();
        if (data.success && data.data[0]?.timezone) {
          location.timezone = data.data[0].timezone;
        }
      } catch (error) {
        console.error('Timezone fetch error:', error);
      } finally {
        setIsSearching(false);
      }
    }

    setSelectedLocation(location);
    setLocationName(location.display_name);
    setLocationResults([]);
  };

  const handleCalculate = async () => {
    if (!date || !time || !selectedLocation) {
      return;
    }

    setIsCalculating(true);

    const birthData: BirthData = {
      date,
      time,
      location: {
        name: selectedLocation.display_name,
        lat: parseFloat(selectedLocation.lat),
        lng: parseFloat(selectedLocation.lon),
        timezone: selectedLocation.timezone || 'UTC',
      },
      houseSystem: 'porphyry',
    };

    try {
      // Save to localStorage for all pages to access
      localStorage.setItem('birthChartData', JSON.stringify(birthData));

      // Also update beta_user profile
      const betaUser = localStorage.getItem('beta_user');
      if (betaUser) {
        const userData = JSON.parse(betaUser);
        userData.birthData = {
          date: birthData.date,
          time: birthData.time,
          location: birthData.location,
          houseSystem: birthData.houseSystem,
        };
        localStorage.setItem('beta_user', JSON.stringify(userData));
      }

      // Save to server profile for persistence
      try {
        const memberId = betaUser ? JSON.parse(betaUser).id : null;
        if (memberId) {
          await apiFetch('/api/members/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: memberId,
              birthData: {
                date: birthData.date,
                time: birthData.time,
                location: birthData.location,
              }
            })
          });
        }
      } catch (e) {
        console.warn('Could not save to server profile:', e);
      }

      setHasExistingData(true);

      // Callback for parent component (e.g., to trigger chart recalculation)
      if (onCalculate) {
        onCalculate(birthData);
      }

      // Close the panel after successful calculation
      setIsOpen(false);

      // Trigger page refresh to show new chart
      window.location.reload();
    } catch (error) {
      console.error('Error saving birth data:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const isFormValid = date && time && selectedLocation;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm transition-all duration-300 ${
          isDayMode
            ? 'bg-amber-100/80 text-amber-800 hover:bg-amber-200/80'
            : 'bg-black/40 text-amber-200 hover:bg-black/60 border border-amber-900/30'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calculator className="w-4 h-4" />
        <span className="text-sm font-medium">
          {hasExistingData ? 'Edit Chart' : 'Calculate Chart'}
        </span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-12 right-0 w-80 rounded-xl shadow-2xl border backdrop-blur-md ${
              isDayMode
                ? 'bg-amber-50/95 border-amber-200'
                : 'bg-stone-900/95 border-amber-900/40'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isDayMode ? 'border-amber-200' : 'border-amber-900/30'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${isDayMode ? 'text-amber-600' : 'text-amber-400'}`} />
                <span className={`text-sm font-medium ${isDayMode ? 'text-amber-800' : 'text-amber-200'}`}>
                  Birth Chart Calculator
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full transition-colors ${
                  isDayMode ? 'hover:bg-amber-200' : 'hover:bg-amber-900/30'
                }`}
              >
                <X className={`w-4 h-4 ${isDayMode ? 'text-amber-600' : 'text-amber-400'}`} />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-4">
              {/* Birth Date */}
              <div>
                <label className={`flex items-center gap-2 text-xs mb-1.5 ${
                  isDayMode ? 'text-amber-700' : 'text-amber-300'
                }`}>
                  <Calendar className="w-3.5 h-3.5" />
                  Birth Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                    isDayMode
                      ? 'bg-white border-amber-300 text-amber-900 focus:border-amber-500'
                      : 'bg-black/40 border-amber-900/40 text-amber-100 focus:border-amber-600'
                  } focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
                  style={{ colorScheme: isDayMode ? 'light' : 'dark' }}
                />
              </div>

              {/* Birth Time */}
              <div>
                <label className={`flex items-center gap-2 text-xs mb-1.5 ${
                  isDayMode ? 'text-amber-700' : 'text-amber-300'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  Birth Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                    isDayMode
                      ? 'bg-white border-amber-300 text-amber-900 focus:border-amber-500'
                      : 'bg-black/40 border-amber-900/40 text-amber-100 focus:border-amber-600'
                  } focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
                  style={{ colorScheme: isDayMode ? 'light' : 'dark' }}
                />
                <p className={`text-[10px] mt-1 italic ${isDayMode ? 'text-amber-600' : 'text-amber-500/70'}`}>
                  If unknown, use 12:00 noon
                </p>
              </div>

              {/* Birth Location */}
              <div className="relative">
                <label className={`flex items-center gap-2 text-xs mb-1.5 ${
                  isDayMode ? 'text-amber-700' : 'text-amber-300'
                }`}>
                  <MapPin className="w-3.5 h-3.5" />
                  Birth Location
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => {
                    setLocationName(e.target.value);
                    setSearchQuery(e.target.value);
                    setSelectedLocation(null);
                  }}
                  placeholder="Type city name..."
                  autoComplete="off"
                  className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${
                    isDayMode
                      ? 'bg-white border-amber-300 text-amber-900 placeholder:text-amber-400 focus:border-amber-500'
                      : 'bg-black/40 border-amber-900/40 text-amber-100 placeholder:text-amber-600 focus:border-amber-600'
                  } focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
                />

                {/* Location Results Dropdown */}
                {locationResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`absolute z-50 w-full mt-1 rounded-lg border overflow-hidden shadow-xl ${
                      isDayMode ? 'bg-white border-amber-300' : 'bg-stone-900 border-amber-900/40'
                    }`}
                    style={{ maxHeight: '180px', overflowY: 'auto' }}
                  >
                    {locationResults.map((result, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleLocationSelect(result)}
                        className={`w-full px-3 py-2 text-left text-xs transition-colors ${
                          isDayMode
                            ? 'hover:bg-amber-100 text-amber-900'
                            : 'hover:bg-amber-900/30 text-amber-100'
                        }`}
                      >
                        <div className="truncate">{result.display_name}</div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {isSearching && (
                  <p className={`text-[10px] mt-1 ${isDayMode ? 'text-amber-600' : 'text-amber-500'}`}>
                    Searching...
                  </p>
                )}

                {selectedLocation && (
                  <p className={`text-[10px] mt-1 ${isDayMode ? 'text-green-700' : 'text-green-400'}`}>
                    ✓ {selectedLocation.timezone || 'Location selected'}
                  </p>
                )}
              </div>

              {/* Calculate Button */}
              <motion.button
                onClick={handleCalculate}
                disabled={!isFormValid || isCalculating}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isFormValid
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                    : isDayMode
                      ? 'bg-amber-200 text-amber-400 cursor-not-allowed'
                      : 'bg-amber-900/30 text-amber-600 cursor-not-allowed'
                }`}
                whileHover={isFormValid ? { scale: 1.01 } : {}}
                whileTap={isFormValid ? { scale: 0.99 } : {}}
              >
                {isCalculating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ✦
                    </motion.span>
                    Calculating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {hasExistingData ? 'Recalculate Chart' : 'Calculate Birth Chart'}
                  </span>
                )}
              </motion.button>

              {/* Info Text */}
              <p className={`text-[10px] text-center ${isDayMode ? 'text-amber-600' : 'text-amber-500/60'}`}>
                Populates your Journey map and all astrological pages
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
