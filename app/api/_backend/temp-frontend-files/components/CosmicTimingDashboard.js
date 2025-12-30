"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmicTimingDashboard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const framer_motion_1 = require("framer-motion");
const comprehensiveAstrologicalService_1 = require("../services/comprehensiveAstrologicalService");
const AstrologicalHoloflowerVisualization_1 = require("./AstrologicalHoloflowerVisualization");
const CosmicTimingDashboard = ({ userId, birthData }) => {
  const [timingData, setTimingData] = (0, react_1.useState)(null);
  const [selectedView, setSelectedView] = (0, react_1.useState)(&quot;overview&quot;);
  const [selectedHouse, setSelectedHouse] = (0, react_1.useState)(null);
  const [loading, setLoading] = (0, react_1.useState)(true);
  // Planetary symbols
  const planetSymbols = {
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
  (0, react_1.useEffect)(() => {
    const loadTimingData = async () => {
      setLoading(true);
      try {
        const [sacredTiming, transits] = await Promise.all([
          comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.generateSacredTiming(
            userId,
          ),
          comprehensiveAstrologicalService_1.comprehensiveAstrologicalService.trackCurrentTransits(
            userId,
          ),
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
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "overview-grid",
      children: [
        (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, {
          className: "timing-card lunar-phase",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.1 },
          children: [
            (0, jsx_runtime_1.jsx)("h3", { children: "Lunar Phase" }),
            (0, jsx_runtime_1.jsxs)("div", {
              className: "lunar-display",
              children: [
                (0, jsx_runtime_1.jsx)("div", {
                  className: "moon-icon",
                  children: getMoonPhaseIcon(lunarCycle.currentPhase),
                }),
                (0, jsx_runtime_1.jsxs)("div", {
                  className: "lunar-info",
                  children: [
                    (0, jsx_runtime_1.jsx)("p", {
                      className: "phase-name",
                      children: lunarCycle.currentPhase,
                    }),
                    (0, jsx_runtime_1.jsxs)("p", {
                      className: "illumination",
                      children: [
                        Math.round(lunarCycle.percentIlluminated),
                        "% illuminated",
                      ],
                    }),
                    (0, jsx_runtime_1.jsxs)("p", {
                      className: "moon-sign",
                      children: ["Moon in ", lunarCycle.moonSign],
                    }),
                    (0, jsx_runtime_1.jsxs)("p", {
                      className: "moon-house",
                      children: ["House ", lunarCycle.moonHouse],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, {
          className: "timing-card cosmic-support",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.2 },
          children: [
            (0, jsx_runtime_1.jsx)("h3", { children: "Active Cosmic Support" }),
            timingData.cosmicSupport.length > 0
              ? (0, jsx_runtime_1.jsx)("div", {
                  className: "support-list",
                  children: timingData.cosmicSupport.map((support, index) =>
                    (0, jsx_runtime_1.jsxs)(
                      "div",
                      {
                        className: "support-item",
                        children: [
                          (0, jsx_runtime_1.jsx)("div", {
                            className: "support-type",
                            children: support.supportType,
                          }),
                          (0, jsx_runtime_1.jsx)("div", {
                            className: "support-description",
                            children: support.description,
                          }),
                          (0, jsx_runtime_1.jsx)("div", {
                            className: "support-intensity",
                            children: (0, jsx_runtime_1.jsx)("div", {
                              className: "intensity-bar",
                              style: { width: `${support.intensity * 100}%` },
                            }),
                          }),
                        ],
                      },
                      index,
                    ),
                  ),
                })
              : (0, jsx_runtime_1.jsx)("p", {
                  className: "no-data",
                  children: "No major cosmic support active",
                }),
          ],
        }),
        (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, {
          className: "timing-card retrogrades",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.3 },
          children: [
            (0, jsx_runtime_1.jsx)("h3", { children: "Current Retrogrades" }),
            retrogradePeriods.filter(
              (r) => r.startDate <= new Date() && r.endDate >= new Date(),
            ).length > 0
              ? (0, jsx_runtime_1.jsx)(&quot;div&quot;, {
                  className: "retrograde-list",
                  children: retrogradePeriods
                    .filter(
                      (r) =>
                        r.startDate <= new Date() && r.endDate >= new Date(),
                    )
                    .map((retro, index) =>
                      (0, jsx_runtime_1.jsxs)(
                        &quot;div&quot;,
                        {
                          className: "retrograde-item",
                          children: [
                            (0, jsx_runtime_1.jsx)("span", {
                              className: "planet-symbol",
                              children: planetSymbols[retro.planet],
                            }),
                            (0, jsx_runtime_1.jsx)("span", {
                              className: "planet-name",
                              children: retro.planet,
                            }),
                            (0, jsx_runtime_1.jsx)("span", {
                              className: "retro-badge",
                              children: "\u211E",
                            }),
                          ],
                        },
                        index,
                      ),
                    ),
                })
              : (0, jsx_runtime_1.jsx)("p", {
                  className: "no-data",
                  children: "No planets in retrograde",
                }),
          ],
        }),
        (0, jsx_runtime_1.jsxs)(framer_motion_1.motion.div, {
          className: "timing-card best-houses",
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.4 },
          children: [
            (0, jsx_runtime_1.jsx)("h3", { children: "Optimal House Work" }),
            (0, jsx_runtime_1.jsx)("div", {
              className: "house-recommendations",
              children: recommendations
                .filter(
                  (r) => r.quality === "excellent" || r.quality === "good",
                )
                .slice(0, 3)
                .map((rec, index) =>
                  (0, jsx_runtime_1.jsxs)(
                    "div",
                    {
                      className: "house-rec",
                      onClick: () => setSelectedHouse(rec.houseNumber),
                      children: [
                        (0, jsx_runtime_1.jsxs)("div", {
                          className: "house-number",
                          children: ["House ", rec.houseNumber],
                        }),
                        (0, jsx_runtime_1.jsx)("div", {
                          className: "rec-quality quality-{rec.quality}",
                          children: rec.quality,
                        }),
                        (0, jsx_runtime_1.jsx)("div", {
                          className: "rec-description",
                          children: rec.description,
                        }),
                        (0, jsx_runtime_1.jsx)("div", {
                          className: "rec-planets",
                          children: rec.planets
                            .map((p) => planetSymbols[p] || p)
                            .join(" "),
                        }),
                      ],
                    },
                    index,
                  ),
                ),
            }),
          ],
        }),
      ],
    });
  };
  const renderMonthlyView = () => {
    if (!timingData) return null;
    const { lunarCycle } = timingData.sacredTiming;
    const activations = lunarCycle.monthlyActivations;
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "monthly-view",
      children: [
        (0, jsx_runtime_1.jsx)("h3", { children: "Monthly Lunar Activations" }),
        (0, jsx_runtime_1.jsx)("div", {
          className: "activation-timeline",
          children: activations.map((activation, index) =>
            (0, jsx_runtime_1.jsxs)(
              framer_motion_1.motion.div,
              {
                className: "activation-item",
                initial: { opacity: 0, x: -20 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: index * 0.05 },
                onClick: () => setSelectedHouse(activation.house),
                children: [
                  (0, jsx_runtime_1.jsx)("div", {
                    className: "activation-date",
                    children: new Date(activation.date).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    ),
                  }),
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "activation-content",
                    children: [
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "house-badge",
                        children: ["House ", activation.house],
                      }),
                      (0, jsx_runtime_1.jsx)("div", {
                        className: "activation-theme",
                        children: activation.theme,
                      }),
                    ],
                  }),
                ],
              },
              index,
            ),
          ),
        }),
        (0, jsx_runtime_1.jsxs)("div", {
          className: "lunar-calendar",
          children: [
            (0, jsx_runtime_1.jsx)("h4", { children: "Lunar Rhythm" }),
            (0, jsx_runtime_1.jsxs)("div", {
              className: "moon-phases",
              children: [
                (0, jsx_runtime_1.jsxs)("div", {
                  className: "phase-marker",
                  children: [
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "phase-date",
                      children: new Date(
                        lunarCycle.nextNewMoon,
                      ).toLocaleDateString(),
                    }),
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "phase-type",
                      children: "New Moon",
                    }),
                  ],
                }),
                (0, jsx_runtime_1.jsxs)("div", {
                  className: "phase-marker",
                  children: [
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "phase-date",
                      children: new Date(
                        lunarCycle.nextFullMoon,
                      ).toLocaleDateString(),
                    }),
                    (0, jsx_runtime_1.jsx)("div", {
                      className: "phase-type",
                      children: "Full Moon",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };
  const renderTransitsView = () => {
    if (!timingData) return null;
    const { currentTransits } = timingData;
    const majorTransits = currentTransits.filter((t) => t.intensity > 0.5);
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "transits-view",
      children: [
        (0, jsx_runtime_1.jsx)("h3", { children: "Active Planetary Transits" }),
        (0, jsx_runtime_1.jsx)("div", {
          className: "transits-grid",
          children: majorTransits.map((transit, index) =>
            (0, jsx_runtime_1.jsxs)(
              framer_motion_1.motion.div,
              {
                className: "transit-card",
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: index * 0.05 },
                onClick: () => setSelectedHouse(transit.houseActivated),
                children: [
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "transit-header",
                    children: [
                      (0, jsx_runtime_1.jsxs)("span", {
                        className: "transit-planet",
                        children: [
                          planetSymbols[transit.transit.planet],
                          " ",
                          transit.transit.planet,
                        ],
                      }),
                      transit.transit.retrograde &&
                        (0, jsx_runtime_1.jsx)("span", {
                          className: "retro-badge",
                          children: "\u211E",
                        }),
                    ],
                  }),
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "transit-details",
                    children: [
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "transit-sign",
                        children: ["in ", transit.transit.sign],
                      }),
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "transit-house",
                        children: ["House ", transit.houseActivated],
                      }),
                      transit.natalPlanetAspected &&
                        (0, jsx_runtime_1.jsxs)("div", {
                          className: "aspect-info",
                          children: [
                            "Aspecting natal ",
                            planetSymbols[transit.natalPlanetAspected],
                          ],
                        }),
                    ],
                  }),
                  (0, jsx_runtime_1.jsx)("div", {
                    className: "transit-influence",
                    children: transit.transit.influence,
                  }),
                  (0, jsx_runtime_1.jsx)("div", {
                    className: "transit-intensity",
                    children: (0, jsx_runtime_1.jsx)("div", {
                      className: "intensity-bar",
                      style: {
                        width: `${transit.intensity * 100}%`,
                        backgroundColor: getIntensityColor(transit.intensity),
                      },
                    }),
                  }),
                ],
              },
              transit.id,
            ),
          ),
        }),
      ],
    });
  };
  const renderOpportunitiesView = () => {
    if (!timingData) return null;
    const { transformationOpportunities } = timingData;
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "opportunities-view",
      children: [
        (0, jsx_runtime_1.jsx)("h3", {
          children: "Transformation Opportunities",
        }),
        (0, jsx_runtime_1.jsx)("div", {
          className: "opportunities-list",
          children: transformationOpportunities.map((opp, index) =>
            (0, jsx_runtime_1.jsxs)(
              framer_motion_1.motion.div,
              {
                className: "opportunity-card",
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
                transition: { delay: index * 0.1 },
                onClick: () => setSelectedHouse(opp.houseActivated),
                children: [
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "opp-header",
                    children: [
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "opp-planet",
                        children: [
                          planetSymbols[opp.transit.planet],
                          " ",
                          opp.transit.planet,
                        ],
                      }),
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "opp-intensity high",
                        children: [Math.round(opp.intensity * 100), "% Power"],
                      }),
                    ],
                  }),
                  (0, jsx_runtime_1.jsx)("div", {
                    className: "opp-description",
                    children: opp.transformationOpportunity,
                  }),
                  (0, jsx_runtime_1.jsxs)("div", {
                    className: "opp-timing",
                    children: [
                      (0, jsx_runtime_1.jsx)("div", {
                        className: "timing-phase",
                        children: getTransitPhase(
                          opp.transit.startDate,
                          opp.transit.exactDate,
                          opp.transit.endDate,
                        ),
                      }),
                      (0, jsx_runtime_1.jsxs)("div", {
                        className: "exact-date",
                        children: [
                          "Exact: ",
                          new Date(opp.transit.exactDate).toLocaleDateString(),
                        ],
                      }),
                    ],
                  }),
                  (0, jsx_runtime_1.jsx)("div", {
                    className: "opp-action",
                    children: (0, jsx_runtime_1.jsxs)("button", {
                      className: "explore-btn",
                      children: ["Explore House ", opp.houseActivated],
                    }),
                  }),
                ],
              },
              opp.id,
            ),
          ),
        }),
      ],
    });
  };
  // Helper functions
  const getMoonPhaseIcon = (phase) => {
    const icons = {
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
  const getIntensityColor = (intensity) => {
    if (intensity > 0.8) return "#FF6B6B";
    if (intensity > 0.6) return "#FFD700";
    if (intensity > 0.4) return "#87CEEB";
    return "#98D8C8";
  };
  const getTransitPhase = (start, exact, end) => {
    const now = new Date();
    if (now < new Date(start)) return "Approaching";
    if (now > new Date(end)) return &quot;Separating&quot;;
    if (Math.abs(now.getTime() - new Date(exact).getTime()) < 86400000)
      return "Exact";
    if (now < new Date(exact)) return "Applying";
    return "Separating";
  };
  if (loading) {
    return (0, jsx_runtime_1.jsxs)("div", {
      className: "cosmic-timing-dashboard loading",
      children: [
        (0, jsx_runtime_1.jsx)("div", {
          className: "loading-spinner",
          children: "\u2609",
        }),
        (0, jsx_runtime_1.jsx)("p", {
          children: "Calculating cosmic timing...",
        }),
      ],
    });
  }
  return (0, jsx_runtime_1.jsxs)("div", {
    className: "cosmic-timing-dashboard",
    children: [
      (0, jsx_runtime_1.jsxs)("div", {
        className: "dashboard-header",
        children: [
          (0, jsx_runtime_1.jsx)("h2", { children: "Cosmic Timing Dashboard" }),
          (0, jsx_runtime_1.jsxs)("div", {
            className: "view-tabs",
            children: [
              (0, jsx_runtime_1.jsx)("button", {
                className: selectedView === "overview" ? "active" : "",
                onClick: () => setSelectedView("overview"),
                children: "Overview",
              }),
              (0, jsx_runtime_1.jsx)("button", {
                className: selectedView === "monthly" ? "active" : "",
                onClick: () => setSelectedView("monthly"),
                children: "Monthly",
              }),
              (0, jsx_runtime_1.jsx)("button", {
                className: selectedView === "transits" ? "active" : "",
                onClick: () => setSelectedView("transits"),
                children: "Transits",
              }),
              (0, jsx_runtime_1.jsx)("button", {
                className: selectedView === "opportunities" ? "active" : "",
                onClick: () => setSelectedView("opportunities"),
                children: "Opportunities",
              }),
            ],
          }),
        ],
      }),
      (0, jsx_runtime_1.jsx)("div", {
        className: "dashboard-content",
        children: (0, jsx_runtime_1.jsxs)(framer_motion_1.AnimatePresence, {
          mode: "wait",
          children: [
            selectedView === "overview" && renderOverview(),
            selectedView === "monthly" && renderMonthlyView(),
            selectedView === "transits" && renderTransitsView(),
            selectedView === "opportunities" && renderOpportunitiesView(),
          ],
        }),
      }),
      selectedHouse &&
        (0, jsx_runtime_1.jsxs)("div", {
          className: "holoflower-preview",
          children: [
            (0, jsx_runtime_1.jsxs)("h3", {
              children: ["House ", selectedHouse, " Focus"],
            }),
            (0, jsx_runtime_1.jsx)(
              AstrologicalHoloflowerVisualization_1.AstrologicalHoloflowerVisualization,
              {
                userId: userId,
                birthData: birthData,
                showPlanetaryInfluences: true,
                showNatalStrengths: true,
              },
            ),
          ],
        }),
      (0, jsx_runtime_1.jsx)("style", {
        jsx: true,
        children: `
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
          color: #FFD700;
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
          border: 1px solid #FFD700;
          color: #FFD700;
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
          color: #FFD700;
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
          color: #87CEEB;
        }

        .support-item {
          margin-bottom: 15px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
        }

        .support-type {
          font-weight: bold;
          color: #FFD700;
          text-transform: capitalize;
          margin-bottom: 5px;
        }

        .support-description {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .intensity-bar {
          height: 4px;
          background: #FFD700;
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
          color: #FF6B6B;
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
          color: #87CEEB;
          margin-bottom: 5px;
        }

        .quality-excellent {
          color: #4CAF50;
        }

        .quality-good {
          color: #FFD700;
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
          color: #FFD700;
          min-width: 60px;
        }

        .house-badge {
          display: inline-block;
          padding: 4px 8px;
          background: #2a2a3e;
          border-radius: 4px;
          font-size: 12px;
          color: #87CEEB;
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
          color: #FFD700;
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
          color: #FFD700;
        }

        .opp-intensity {
          padding: 5px 10px;
          background: #FF6B6B;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
        }

        .explore-btn {
          padding: 8px 16px;
          background: #FFD700;
          color: #0a0a0f;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .explore-btn:hover {
          background: #FFA500;
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
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `,
      }),
    ],
  });
};
exports.CosmicTimingDashboard = CosmicTimingDashboard;
