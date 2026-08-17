'use client';

/**
 * Birth Chart Calculator - Compact Corner Widget
 *
 * A collapsible birth data entry widget for the upper right corner.
 * Uses the shared useBirthChart hook for cross-page state synchronization.
 *
 * Start anywhere, updates everywhere:
 * - /journey (interactive map)
 * - /astrology (blueprint)
 * - Settings > Birth Chart
 *
 * Supports two variants:
 * - 'corner' (default): Fixed position in upper right
 * - 'inline': Embedded in page content (for Settings)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Calendar, Clock, MapPin, ChevronDown, ChevronUp, Sparkles, X, Check } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { useBirthChart, type BirthData, type BirthLocation } from '@/lib/hooks/useBirthChart';

interface BirthChartCalculatorProps {
  onCalculate?: (data: BirthData) => void;
  isDayMode?: boolean;
  variant?: 'corner' | 'inline';
}

export function BirthChartCalculator({
  onCalculate,
  isDayMode = false,
  variant = 'corner'
}: BirthChartCalculatorProps) {
  const { birthData, isLoading, isComplete, save } = useBirthChart();

  const [isOpen, setIsOpen] = useState(variant === 'inline');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [locationName, setLocationName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    display_name: string;
    lat: string | number;
    lon: string | number;
    timezone?: string;
  } | null>(null);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Populate form fields from existing birth data
  useEffect(() => {
    if (birthData && !isLoading) {
      setDate(birthData.date || '');
      setTime(birthData.time || '12:00');
      if (birthData.location) {
        setLocationName(birthData.location.name || '');
        setSelectedLocation({
          display_name: birthData.location.name,
          lat: birthData.location.lat,
          lon: birthData.location.lng,
          timezone: birthData.location.timezone,
        });
      }
    }
  }, [birthData, isLoading]);

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

    setIsSaving(true);
    setSaveSuccess(false);

    const newBirthData: BirthData = {
      date,
      time,
      location: {
        name: selectedLocation.display_name,
        lat: parseFloat(String(selectedLocation.lat)),
        lng: parseFloat(String(selectedLocation.lon)),
        timezone: selectedLocation.timezone || 'UTC',
      },
      houseSystem: 'porphyry',
    };

    try {
      // Save using the shared hook (updates all storage locations + broadcasts event)
      const success = await save(newBirthData);

      if (success) {
        setSaveSuccess(true);

        // Callback for parent component
        if (onCalculate) {
          onCalculate(newBirthData);
        }

        // Close the panel after successful save (corner variant only)
        if (variant === 'corner') {
          setTimeout(() => {
            setIsOpen(false);
            setSaveSuccess(false);
          }, 1500);
        } else {
          // For inline variant, show success briefly
          setTimeout(() => setSaveSuccess(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error saving birth data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = date && time && selectedLocation;

  // Inline variant - renders as a card without fixed positioning
  if (variant === 'inline') {
    return (
      <div className={`rounded-xl border backdrop-blur-md ${
        isDayMode
          ? 'bg-amber-50/95 border-amber-200'
          : 'bg-stone-900/95 border-amber-900/40'
      }`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${
          isDayMode ? 'border-amber-200' : 'border-amber-900/30'
        }`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${isDayMode ? 'text-amber-600' : 'text-amber-400'}`} />
            <span className={`text-sm font-medium ${isDayMode ? 'text-amber-800' : 'text-amber-200'}`}>
              Birth Chart Data
            </span>
          </div>
          {isComplete && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isDayMode ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-400'
            }`}>
              Complete
            </span>
          )}
        </div>

        {renderForm()}
      </div>
    );
  }

  // Corner variant - fixed position with toggle
  return (
    // top-4 alone put the Edit Chart control under the status bar / Dynamic
    // Island on iOS, clipping it. Allow for the safe-area inset.
    <div className="fixed right-4 z-50 top-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))]">
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
        {isComplete ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Calculator className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {isComplete ? 'Edit Chart' : 'Calculate Chart'}
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

            {renderForm()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Shared form renderer
  function renderForm() {
    return (
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
          disabled={!isFormValid || isSaving}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
            saveSuccess
              ? 'bg-green-500 text-white'
              : isFormValid
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : isDayMode
                  ? 'bg-amber-200 text-amber-400 cursor-not-allowed'
                  : 'bg-amber-900/30 text-amber-600 cursor-not-allowed'
          }`}
          whileHover={isFormValid && !saveSuccess ? { scale: 1.01 } : {}}
          whileTap={isFormValid && !saveSuccess ? { scale: 0.99 } : {}}
        >
          {saveSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          ) : isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                ✦
              </motion.span>
              Saving...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              {isComplete ? 'Update Chart' : 'Calculate Birth Chart'}
            </span>
          )}
        </motion.button>

        {/* Info Text */}
        <p className={`text-[10px] text-center ${isDayMode ? 'text-amber-600' : 'text-amber-500/60'}`}>
          Updates all astrological pages instantly
        </p>
      </div>
    );
  }
}
