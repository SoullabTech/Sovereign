"use client";

import React, { useState, useEffect } from "react";

interface IChingData {
  profile: any;
  birthArchetype: any;
  currentArchetype: any;
  compatibility?: any;
}

export default function AstrologyDashboard() {
  const [birthDate, setBirthDate] = useState("");
  const [iChingData, setIChingData] = useState<IChingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load default birth date from localStorage or use a sample date
  useEffect(() => {
    const savedBirthDate = localStorage.getItem("userBirthDate");
    if (savedBirthDate) {
      setBirthDate(savedBirthDate);
      loadIChingProfile(savedBirthDate);
    } else {
      // Default to a sample date for demo
      const sampleDate = "1990-06-15";
      setBirthDate(sampleDate);
      loadIChingProfile(sampleDate);
    }
  }, []);

  const loadIChingProfile = async (dateString: string) => {
    if (!dateString) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/iching/astro?birthDate=${dateString}`);
      const data = await response.json();

      if (data.success) {
        setIChingData(data);
        localStorage.setItem("userBirthDate", dateString);
      } else {
        setError(data.error || "Failed to load I Ching profile");
      }
    } catch (err) {
      setError("Network error loading I Ching profile");
      console.error("I Ching profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthDate) {
      loadIChingProfile(birthDate);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-background via-soul-surface to-soul-background">
      <div className="max-w-7xl mx-auto px-6 py-12 text-soul-textPrimary">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-extralight text-soul-textPrimary tracking-tight mb-6">
            Sacred Timing
          </h1>
          <p className="text-xl font-light text-soul-textSecondary max-w-2xl leading-relaxed">
            Explore your cosmic blueprint through Taoist and I Ching astrology
          </p>
        </div>

        {/* Birth Date Input */}
        <div className="max-w-md mx-auto mb-16">
          <div className="bg-soul-surface/40 border border-soul-accent/20 rounded-lg backdrop-blur-sm p-8">
            <h3 className="text-xl font-light text-soul-textPrimary mb-6 tracking-wide">Birth Information</h3>
            <form onSubmit={handleDateSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-sm font-light text-soul-textSecondary uppercase tracking-widest mb-3"
                >
                  Birth Date
                </label>
                <input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-4 py-3 bg-soul-background/60 border border-soul-accent/30 rounded-md text-soul-textPrimary placeholder-soul-textTertiary focus:outline-none focus:ring-2 focus:ring-soul-accent/50 focus:border-soul-accent transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-soul-accent via-soul-accentGlow to-soul-highlight px-6 py-4 rounded-md font-light tracking-wide text-soul-background hover:shadow-lg hover:shadow-soul-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                disabled={loading || !birthDate}
              >
                {loading
                  ? "Generating Profile..."
                  : "Generate Astrology Profile"}
              </button>
            </form>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-soul-surface/60 border border-soul-accent/30 rounded-lg p-6 backdrop-blur-sm">
              <p className="text-soul-textSecondary">Network error loading I Ching profile</p>
            </div>
          </div>
        )}

        {/* Main Astrology Content */}
        <div className="w-full">
          <div className="max-w-4xl mx-auto">
            {iChingData ? (
              <div className="bg-soul-surface/40 border border-soul-accent/20 rounded-lg backdrop-blur-sm p-8">
                <h2 className="text-3xl font-extralight text-soul-textPrimary mb-8 tracking-wide">
                  Your I Ching Profile
                </h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-light text-soul-textPrimary mb-4 tracking-wide">Birth Profile</h3>
                    <pre className="bg-soul-background/60 border border-soul-accent/20 p-6 rounded-md text-sm text-soul-textSecondary overflow-auto font-mono leading-relaxed">
                      {JSON.stringify(iChingData.profile, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-soul-textPrimary mb-4 tracking-wide">Birth Archetype</h3>
                    <pre className="bg-soul-background/60 border border-soul-accent/20 p-6 rounded-md text-sm text-soul-textSecondary overflow-auto font-mono leading-relaxed">
                      {JSON.stringify(iChingData.birthArchetype, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-xl font-light text-soul-textPrimary mb-4 tracking-wide">Current Archetype</h3>
                    <pre className="bg-soul-background/60 border border-soul-accent/20 p-6 rounded-md text-sm text-soul-textSecondary overflow-auto font-mono leading-relaxed">
                      {JSON.stringify(iChingData.currentArchetype, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-soul-surface/40 border border-soul-accent/20 rounded-lg backdrop-blur-sm p-16 text-center">
                <div className="w-16 h-16 mx-auto mb-8 text-soul-accent/60">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                    <circle cx="12" cy="12" r="10"/>
                    <polygon points="10,8 16,12 10,16"/>
                  </svg>
                </div>
                <p className="text-soul-textSecondary font-light leading-relaxed">
                  Enter your birth date to generate your I Ching astrology profile
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-light text-soul-textPrimary mb-4 tracking-wide">Next Steps</h3>
            <p className="text-soul-textSecondary font-light leading-relaxed">
              Voice journaling for creative breakthroughs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-l-2 border-soul-waterWarm/40 pl-6 hover:border-soul-waterWarm transition-colors duration-300 group cursor-pointer">
              <h4 className="text-lg font-light text-soul-textPrimary mb-2 group-hover:text-soul-waterWarm transition-colors">Get today's I Ching guidance</h4>
              <p className="text-sm text-soul-textSecondary">Daily guidance through archetypal wisdom</p>
            </div>

            <div className="border-l-2 border-soul-earthWarm/40 pl-6 hover:border-soul-earthWarm transition-colors duration-300 group cursor-pointer">
              <h4 className="text-lg font-light text-soul-textPrimary mb-2 group-hover:text-soul-earthWarm transition-colors">Find auspicious dates</h4>
              <p className="text-sm text-soul-textSecondary">Archetypal timing patterns for your growth</p>
            </div>

            <div className="border-l-2 border-soul-fireWarm/40 pl-6 hover:border-soul-fireWarm transition-colors duration-300 group cursor-pointer">
              <h4 className="text-lg font-light text-soul-textPrimary mb-2 group-hover:text-soul-fireWarm transition-colors">Compare trigram profiles</h4>
              <p className="text-sm text-soul-textSecondary">Explore consciousness pattern compatibility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
