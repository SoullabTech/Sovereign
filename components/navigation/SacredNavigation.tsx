import React, { useState } from "react";
import { motion } from "framer-motion";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  position: { x: number; y: number };
  significance: "primary" | "secondary" | "tertiary";
}

interface SacredNavigationProps {
  currentRoute?: string;
  onNavigate: (route: string) => void;
}

const SacredNavigation: React.FC<SacredNavigationProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sacred geometric arrangement based on Vector Equilibrium / Cuboctahedron
  const navigationItems: NavigationItem[] = [
    // Center - Oracle Access
    {
      id: "oracle",
      label: "Oracle",
      icon: "🧙",
      route: "/oracle",
      position: { x: 0, y: 0 },
      significance: "primary",
    },

    // Primary vertices (core functions)
    {
      id: "holoflower",
      label: "Holoflower",
      icon: "🌸",
      route: "/holoflower",
      position: { x: 0, y: -80 },
      significance: "primary",
    },
    {
      id: "memory",
      label: "Memory",
      icon: "📖",
      route: "/memory",
      position: { x: 69.3, y: 40 },
      significance: "primary",
    },
    {
      id: "insights",
      label: "Insights",
      icon: "🌀",
      route: "/insights",
      position: { x: -69.3, y: 40 },
      significance: "primary",
    },

    // Secondary vertices (expanded functions)
    {
      id: "astrology",
      label: "Astrology",
      icon: "🪐",
      route: "/astrology",
      position: { x: 56.6, y: -56.6 },
      significance: "secondary",
    },
    {
      id: "agents",
      label: "Agents",
      icon: "👥",
      route: "/agents",
      position: { x: -56.6, y: -56.6 },
      significance: "secondary",
    },
    {
      id: "patterns",
      label: "Patterns",
      icon: "🔮",
      route: "/patterns",
      position: { x: 113.2, y: 0 },
      significance: "secondary",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "⚙️",
      route: "/settings",
      position: { x: -113.2, y: 0 },
      significance: "secondary",
    },
  ];

  const getItemSize = (significance: string, isActive: boolean) => {
    const baseSize =
      significance === "primary" ? 60 : significance === "secondary" ? 48 : 36;
    return isActive ? baseSize * 1.2 : baseSize;
  };

  const getItemOpacity = (significance: string, isExpanded: boolean) => {
    if (!isExpanded && significance !== "primary") return 0;
    return significance === "primary"
      ? 1
      : significance === "secondary"
        ? 0.8
        : 0.6;
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        {/* Navigation Container */}
        <div className="relative w-64 h-64">
          {navigationItems.map((item) => {
            const isActive = currentRoute === item.route;
            const size = getItemSize(item.significance, isActive);

            return (
              <motion.button
                key={item.id}
                className={`absolute flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "bg-amber-600 border-amber-500 text-slate-900 shadow-lg shadow-amber-600/25"
                    : "bg-slate-800/90 border-slate-600 text-amber-100 hover:border-amber-500 backdrop-blur-sm"
                }`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `calc(50% + ${item.position.x}px - ${size / 2}px)`,
                  top: `calc(50% + ${item.position.y}px - ${size / 2}px)`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: getItemOpacity(item.significance, isExpanded),
                  x: isExpanded ? 0 : item.position.x * 0.3,
                  y: isExpanded ? 0 : item.position.y * 0.3,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{
                  duration: 0.618,
                  delay: navigationItems.indexOf(item) * 0.05,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                onClick={() => onNavigate(item.route)}
              >
                <span className="text-xl">{item.icon}</span>
              </motion.button>
            );
          })}

          {/* Connecting Lines (Sacred Geometry) */}
          {isExpanded && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: -1 }}
            >
              {/* Golden Ratio Spiral */}
              <motion.path
                d="M 128 128 Q 128 48 208 128 Q 128 208 48 128 Q 128 48 128 128"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1"
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
              />

              {/* Vector Equilibrium Structure */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {/* Primary triangle */}
                <path
                  d={`M 128 48 L 197.3 168 L 58.7 168 Z`}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1"
                />

                {/* Secondary connections */}
                <path
                  d={`M 184.6 71.4 L 128 128 L 71.4 71.4`}
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="1"
                />
              </motion.g>
            </svg>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <motion.button
          className="absolute bottom-0 right-0 w-16 h-16 bg-amber-600 text-slate-900 rounded-full border-2 border-amber-500 shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <motion.span
            className="text-xl"
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? "✕" : "⚡"}
          </motion.span>
        </motion.button>

        {/* Active Route Label */}
        {currentRoute && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-12 right-0 px-3 py-1 bg-slate-800/90 backdrop-blur-sm border border-slate-600 text-amber-100 text-sm font-medium"
          >
            {navigationItems.find((item) => item.route === currentRoute)
              ?.label || "Unknown"}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SacredNavigation;
