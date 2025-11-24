import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { comprehensiveAstrologicalService } from "../services/comprehensiveAstrologicalService";
import { AstrologicalHoloflowerVisualization } from "./AstrologicalHoloflowerVisualization";

interface CosmicTimingDashboardProps {
  userId: string;
  birthData?: {
    date: Date;
    time: string;
    location: { lat: number; lng: number };
  };
}

interface TimingData {
  sacredTiming: any;
  currentTransits: any[];
  transformationOpportunities: any[];
  cosmicSupport: any[];
}

export const CosmicTimingDashboard: React.FC<CosmicTimingDashboardProps> = ({
  userId,
  birthData,
}) => {
  const [timingData, setTimingData] = useState<TimingData | null>(null);
  const [selectedView, setSelectedView] = useState<
    "overview" | "monthly" | "transits" | "opportunities"
  >("overview");
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Planetary symbols
  const planetSymbols: Record<string, string> = {
    sun: "☉",
    moon: "☽",
    mercury: "☿",
    venus: "♀",
    mars: "♂",
    jupiter: "♃",
    saturn: "♄",
    uranus: "♅",
    neptune: "♆",
    pluto: "♇",
  };

  // Load timing data
  useEffect(() => {
    const loadTimingData = async () => {
      setLoading(true);
      try {
        const [sacredTiming, transits] = await Promise.all([
          comprehensiveAstrologicalService.generateSacredTiming(userId),
          comprehensiveAstrologicalService.trackCurrentTransits(userId),
        ]);

        // Filter transformation opportunities
        const opportunities = transits
          .filter((t) => t.intensity > 0.6)
          .sort((a, b) => b.intensity - a.intensity);

        // Get current cosmic support
        const cosmicSupport = sacredTiming.cosmicSupport.filter(
          (s) => s.startDate <= new Date() && s.endDate >= new Date(),
        );

        setTimingData({
          sacredTiming,
          currentTransits: transits,
          transformationOpportunities: opportunities,
          cosmicSupport,
        });
      } catch (error) {
        console.error("Error loading timing data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadTimingData();

      // Refresh every 5 minutes
      const interval = setInterval(loadTimingData, 300000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const renderOverview = () => {
    if (!timingData) return null;

    const { sacredTiming } = timingData;
    const { lunarCycle, recommendations, retrogradePeriods } = sacredTiming;

    return (
      <div className="overview-grid">
        {/* Current Lunar Phase */}
        <motion.div
          className="timing-card lunar-phase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3>Lunar Phase</h3>
          <div className="lunar-display">
            <div className="moon-icon">
              {getMoonPhaseIcon(lunarCycle.currentPhase)}
            </div>
            <div className="lunar-info">
              <p className="phase-name">{lunarCycle.currentPhase}</p>
              <p className="illumination">
                {Math.round(lunarCycle.percentIlluminated)}% illuminated
              </p>
              <p className="moon-sign">Moon in {lunarCycle.moonSign}</p>
              <p className="moon-house">House {lunarCycle.moonHouse}</p>
            </div>
          </div>
        </motion.div>

        {/* Active Cosmic Support */}
        <motion.div
          className="timing-card cosmic-support"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Active Cosmic Support</h3>
          {timingData.cosmicSupport.length > 0 ? (
            <div className="support-list">
              {timingData.cosmicSupport.map((support, index) => (
                <div key={index} className="support-item">
                  <div className="support-type">{support.supportType}</div>
                  <div className="support-description">
                    {support.description}
                  </div>
                  <div className="support-intensity">
                    <div
                      className="intensity-bar"
                      style={{ width: `${support.intensity * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No major cosmic support active</p>
          )}
        </motion.div>

        {/* Current Retrogrades */}
        <motion.div
          className="timing-card retrogrades"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Current Retrogrades</h3>
          {retrogradePeriods.filter(
            (r) => r.startDate <= new Date() && r.endDate >= new Date(),
          ).length > 0 ? (
            <div className="retrograde-list">
              {retrogradePeriods
                .filter(
                  (r) => r.startDate <= new Date() && r.endDate >= new Date(),
                )
                .map((retro, index) => (
                  <div key={index} className="retrograde-item">
                    <span className="planet-symbol">
                      {planetSymbols[retro.planet]}
                    </span>
                    <span className="planet-name">{retro.planet}</span>
                    <span className="retro-badge">℞</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="no-data">No planets in retrograde</p>
          )}
        </motion.div>

        {/* Best Houses to Work With */}
        <motion.div
          className="timing-card best-houses"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3>Optimal House Work</h3>
          <div className="house-recommendations">
            {recommendations
              .filter((r) => r.quality === "excellent" || r.quality === "good")
              .slice(0, 3)
              .map((rec, index) => (
                <div
                  key={index}
                  className="house-rec"
                  onClick={() => setSelectedHouse(rec.houseNumber)}
                >
                  <div className="house-number">House {rec.houseNumber}</div>
                  <div className="rec-quality quality-{rec.quality}">
                    {rec.quality}
                  </div>
                  <div className="rec-description">{rec.description}</div>
                  <div className="rec-planets">
                    {rec.planets.map((p) => planetSymbols[p] || p).join(" ")}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    if (!timingData) return null;

    const { lunarCycle } = timingData.sacredTiming;
    const activations = lunarCycle.monthlyActivations;

    return (
      <div className="monthly-view">
        <h3>Monthly Lunar Activations</h3>
        <div className="activation-timeline">
          {activations.map((activation, index) => (
            <motion.div
              key={index}
              className="activation-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedHouse(activation.house)}
            >
              <div className="activation-date">
                {new Date(activation.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="activation-content">
                <div className="house-badge">House {activation.house}</div>
                <div className="activation-theme">{activation.theme}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lunar-calendar">
          <h4>Lunar Rhythm</h4>
          <div className="moon-phases">
            <div className="phase-marker">
              <div className="phase-date">
                {new Date(lunarCycle.nextNewMoon).toLocaleDateString()}
              </div>
              <div className="phase-type">New Moon</div>
            </div>
            <div className="phase-marker">
              <div className="phase-date">
                {new Date(lunarCycle.nextFullMoon).toLocaleDateString()}
              </div>
              <div className="phase-type">Full Moon</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTransitsView = () => {
    if (!timingData) return null;

    const { currentTransits } = timingData;
    const majorTransits = currentTransits.filter((t) => t.intensity > 0.5);

    return (
      <div className="transits-view">
        <h3>Active Planetary Transits</h3>
        <div className="transits-grid">
          {majorTransits.map((transit, index) => (
            <motion.div
              key={transit.id}
              className="transit-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedHouse(transit.houseActivated)}
            >
              <div className="transit-header">
                <span className="transit-planet">
                  {planetSymbols[transit.transit.planet]}{" "}
                  {transit.transit.planet}
                </span>
                {transit.transit.retrograde && (
                  <span className="retro-badge">℞</span>
                )}
              </div>
              <div className="transit-details">
                <div className="transit-sign">in {transit.transit.sign}</div>
                <div className="transit-house">
                  House {transit.houseActivated}
                </div>
                {transit.natalPlanetAspected && (
                  <div className="aspect-info">
                    Aspecting natal {planetSymbols[transit.natalPlanetAspected]}
                  </div>
                )}
              </div>
              <div className="transit-influence">
                {transit.transit.influence}
              </div>
              <div className="transit-intensity">
                <div
                  className="intensity-bar"
                  style={{
                    width: `${transit.intensity * 100}%`,
                    backgroundColor: getIntensityColor(transit.intensity),
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderOpportunitiesView = () => {
    if (!timingData) return null;

    const { transformationOpportunities } = timingData;

    return (
      <div className="opportunities-view">
        <h3>Transformation Opportunities</h3>
        <div className="opportunities-list">
          {transformationOpportunities.map((opp, index) => (
            <motion.div
              key={opp.id}
              className="opportunity-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedHouse(opp.houseActivated)}
            >
              <div className="opp-header">
                <div className="opp-planet">
                  {planetSymbols[opp.transit.planet]} {opp.transit.planet}
                </div>
                <div className="opp-intensity high">
                  {Math.round(opp.intensity * 100)}% Power
                </div>
              </div>
              <div className="opp-description">
                {opp.transformationOpportunity}
              </div>
              <div className="opp-timing">
                <div className="timing-phase">
                  {getTransitPhase(
                    opp.transit.startDate,
                    opp.transit.exactDate,
                    opp.transit.endDate,
                  )}
                </div>
                <div className="exact-date">
                  Exact: {new Date(opp.transit.exactDate).toLocaleDateString()}
                </div>
              </div>
              <div className="opp-action">
                <button className="explore-btn">
                  Explore House {opp.houseActivated}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Helper functions
  const getMoonPhaseIcon = (phase: string): string => {
    const icons: Record<string, string> = {
      "New Moon": "🌑",
      "Waxing Crescent": "🌒",
      "First Quarter": "🌓",
      "Waxing Gibbous": "🌔",
      "Full Moon": "🌕",
      "Waning Gibbous": "🌖",
      "Last Quarter": "🌗",
      "Waning Crescent": "🌘",
    };
    return icons[phase] || "🌙";
  };

  const getIntensityColor = (intensity: number): string => {
    if (intensity > 0.8) return "#FF6B6B";
    if (intensity > 0.6) return "#FFD700";
    if (intensity > 0.4) return "#87CEEB";
    return "#98D8C8";
  };

  const getTransitPhase = (start: Date, exact: Date, end: Date): string => {
    const now = new Date();
    if (now < new Date(start)) return "Approaching";
    if (now > new Date(end)) return "Separating";
    if (Math.abs(now.getTime() - new Date(exact).getTime()) < 86400000)
      return "Exact";
    if (now < new Date(exact)) return "Applying";
    return "Separating";
  };

  if (loading) {
    return (
      <div className="cosmic-timing-dashboard loading">
        <div className="loading-spinner">☉</div>
        <p>Calculating cosmic timing...</p>
      </div>
    );
  }

  return (
    <div className="cosmic-timing-dashboard">
      <div className="dashboard-header">
        <h2>Cosmic Timing Dashboard</h2>
        <div className="view-tabs">
          <button
            className={selectedView === "overview" ? "active" : ""}
            onClick={() => setSelectedView("overview")}
          >
            Overview
          </button>
          <button
            className={selectedView === "monthly" ? "active" : ""}
            onClick={() => setSelectedView("monthly")}
          >
            Monthly
          </button>
          <button
            className={selectedView === "transits" ? "active" : ""}
            onClick={() => setSelectedView("transits")}
          >
            Transits
          </button>
          <button
            className={selectedView === "opportunities" ? "active" : ""}
            onClick={() => setSelectedView("opportunities")}
          >
            Opportunities
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <AnimatePresence mode="wait">
          {selectedView === "overview" && renderOverview()}
          {selectedView === "monthly" && renderMonthlyView()}
          {selectedView === "transits" && renderTransitsView()}
          {selectedView === "opportunities" && renderOpportunitiesView()}
        </AnimatePresence>
      </div>

      {selectedHouse && (
        <div className="holoflower-preview">
          <h3>House {selectedHouse} Focus</h3>
          <AstrologicalHoloflowerVisualization
            userId={userId}
            birthData={birthData}
            showPlanetaryInfluences={true}
            showNatalStrengths={true}
          />
        </div>
      )}

      <style jsx>{`
        .cosmic-timing-dashboard {
          padding: 20px;
          background: #0a0a0f;
          color: white;
          min-height: 100vh;
        }

        .dashboard-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .dashboard-header h2 {
          font-size: 32px;
          color: #ffd700;
          margin-bottom: 20px;
        }

        .view-tabs {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .view-tabs button {
          padding: 10px 20px;
          background: #2a2a3e;
          border: 1px solid #ffd700;
          color: #ffd700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .view-tabs button.active,
        .view-tabs button:hover {
          background: #3a3a4e;
          transform: translateY(-2px);
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .timing-card {
          background: rgba(42, 42, 62, 0.9);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.3);
        }

        .timing-card h3 {
          color: #ffd700;
          margin-bottom: 15px;
          font-size: 18px;
        }

        .lunar-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .moon-icon {
          font-size: 48px;
        }

        .lunar-info p {
          margin: 5px 0;
          font-size: 14px;
        }

        .phase-name {
          font-weight: bold;
          color: #87ceeb;
        }

        .support-item {
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
        }

        .support-type {
          font-weight: bold;
          color: #ffd700;
          text-transform: capitalize;
          margin-bottom: 5px;
        }

        .support-description {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .intensity-bar {
          height: 4px;
          background: #ffd700;
          border-radius: 2px;
          transition: width 0.3s;
        }

        .retrograde-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          margin-bottom: 8px;
        }

        .planet-symbol {
          font-size: 20px;
        }

        .retro-badge {
          color: #ff6b6b;
          font-weight: bold;
        }

        .house-rec {
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .house-rec:hover {
          background: rgba(255, 215, 0, 0.1);
          transform: translateX(5px);
        }

        .house-number {
          font-weight: bold;
          color: #87ceeb;
          margin-bottom: 5px;
        }

        .quality-excellent {
          color: #4caf50;
        }

        .quality-good {
          color: #ffd700;
        }

        .monthly-view {
          max-width: 800px;
          margin: 0 auto;
        }

        .activation-timeline {
          margin-top: 20px;
        }

        .activation-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 15px;
          background: rgba(42, 42, 62, 0.9);
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .activation-item:hover {
          background: rgba(255, 215, 0, 0.1);
          transform: translateX(10px);
        }

        .activation-date {
          font-weight: bold;
          color: #ffd700;
          min-width: 60px;
        }

        .house-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #2a2a3e;
          border-radius: 4px;
          font-size: 12px;
          color: #87ceeb;
          margin-bottom: 5px;
        }

        .transits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }

        .transit-card {
          background: rgba(42, 42, 62, 0.9);
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .transit-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
        }

        .transit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-weight: bold;
          color: #ffd700;
        }

        .opportunity-card {
          background: rgba(42, 42, 62, 0.95);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 15px;
          border: 2px solid rgba(255, 215, 0, 0.5);
          cursor: pointer;
          transition: all 0.3s;
        }

        .opportunity-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
        }

        .opp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .opp-planet {
          font-size: 18px;
          font-weight: bold;
          color: #ffd700;
        }

        .opp-intensity {
          padding: 5px 10px;
          background: #ff6b6b;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .explore-btn {
          padding: 8px 16px;
          background: #ffd700;
          color: #0a0a0f;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .explore-btn:hover {
          background: #ffa500;
          transform: scale(1.05);
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .loading-spinner {
          font-size: 48px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
