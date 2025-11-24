"use client";

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface PlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  x: number;
  y: number;
  color: string;
  symbol: string;
}

interface AstrologyData {
  planets: PlanetPosition[];
  houses: { number: number; cusp: number; sign: string }[];
  aspects: { planet1: string; planet2: string; type: string; orb: number; color: string }[];
  lastUpdated: string;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', color: '#FF6B6B' },
  { name: 'Taurus', symbol: '♉', color: '#4ECDC4' },
  { name: 'Gemini', symbol: '♊', color: '#45B7D1' },
  { name: 'Cancer', symbol: '♋', color: '#96CEB4' },
  { name: 'Leo', symbol: '♌', color: '#FECA57' },
  { name: 'Virgo', symbol: '♍', color: '#48CAE4' },
  { name: 'Libra', symbol: '♎', color: '#FF9FF3' },
  { name: 'Scorpio', symbol: '♏', color: '#54A0FF' },
  { name: 'Sagittarius', symbol: '♐', color: '#5F27CD' },
  { name: 'Capricorn', symbol: '♑', color: '#00D2D3' },
  { name: 'Aquarius', symbol: '♒', color: '#FF9FF3' },
  { name: 'Pisces', symbol: '♓', color: '#A4B0BE' },
];

const PLANET_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  'South Node': '☋',
  Chiron: '⚷'
};

export default function AstrologyConsciousnessField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [astrologyData, setAstrologyData] = useState<AstrologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [stars, setStars] = useState<Array<{x: number, y: number, brightness: number}>>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    generateMockAstrologyData();
    generateStarField();
    startAnimation();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const generateStarField = () => {
    const starArray = [];
    for (let i = 0; i < 200; i++) {
      starArray.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        brightness: Math.random()
      });
    }
    setStars(starArray);
  };

  const generateMockAstrologyData = () => {
    // Mock astrology data with realistic planetary positions
    const mockPlanets: PlanetPosition[] = [
      { name: 'Sun', sign: 'Scorpio', degree: 22.45, house: 8, x: 400, y: 300, color: '#FECA57', symbol: '☉' },
      { name: 'Moon', sign: 'Cancer', degree: 15.30, house: 4, x: 350, y: 250, color: '#A4B0BE', symbol: '☽' },
      { name: 'Mercury', sign: 'Sagittarius', degree: 5.12, house: 9, x: 450, y: 280, color: '#48CAE4', symbol: '☿' },
      { name: 'Venus', sign: 'Libra', degree: 18.67, house: 7, x: 370, y: 320, color: '#FF9FF3', symbol: '♀' },
      { name: 'Mars', sign: 'Leo', degree: 28.90, house: 5, x: 430, y: 240, color: '#FF6B6B', symbol: '♂' },
      { name: 'Jupiter', sign: 'Taurus', degree: 7.23, house: 2, x: 320, y: 300, color: '#4ECDC4', symbol: '♃' },
      { name: 'Saturn', sign: 'Capricorn', degree: 12.45, house: 10, x: 400, y: 200, color: '#54A0FF', symbol: '♄' },
      { name: 'Uranus', sign: 'Gemini', degree: 19.78, house: 3, x: 380, y: 350, color: '#45B7D1', symbol: '♅' },
      { name: 'Neptune', sign: 'Pisces', degree: 25.11, house: 12, x: 420, y: 180, color: '#5F27CD', symbol: '♆' },
      { name: 'Pluto', sign: 'Aquarius', degree: 3.56, house: 11, x: 460, y: 220, color: '#00D2D3', symbol: '♇' },
      { name: 'North Node', sign: 'Aries', degree: 9.89, house: 1, x: 480, y: 300, color: '#96CEB4', symbol: '☊' },
      { name: 'Chiron', sign: 'Virgo', degree: 14.23, house: 6, x: 340, y: 280, color: '#FECA57', symbol: '⚷' }
    ];

    const mockHouses = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      cusp: (i * 30) % 360,
      sign: ZODIAC_SIGNS[i % 12].name
    }));

    const mockAspects = [
      { planet1: 'Sun', planet2: 'Moon', type: 'Square', orb: 2.1, color: '#FF6B6B' },
      { planet1: 'Venus', planet2: 'Mars', type: 'Trine', orb: 1.5, color: '#4ECDC4' },
      { planet1: 'Mercury', planet2: 'Jupiter', type: 'Conjunction', orb: 0.8, color: '#FECA57' },
      { planet1: 'Saturn', planet2: 'Uranus', type: 'Opposition', orb: 3.2, color: '#FF9FF3' },
      { planet1: 'Neptune', planet2: 'Pluto', type: 'Sextile', orb: 1.9, color: '#45B7D1' }
    ];

    setAstrologyData({
      planets: mockPlanets,
      houses: mockHouses,
      aspects: mockAspects,
      lastUpdated: new Date().toLocaleTimeString()
    });
    setLoading(false);
  };

  const startAnimation = () => {
    const animate = () => {
      drawChart();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !astrologyData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with cosmic background
    const gradient = ctx.createRadialGradient(400, 300, 0, 400, 300, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f0f23');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw flowing stars
    stars.forEach((star, index) => {
      const time = Date.now() * 0.001;
      const brightness = 0.3 + 0.7 * (Math.sin(time + index * 0.1) * 0.5 + 0.5);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * star.brightness})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw zodiac wheel
    drawZodiacWheel(ctx);

    // Draw house divisions
    drawHouses(ctx);

    // Draw planetary aspects
    drawAspects(ctx);

    // Draw planets
    drawPlanets(ctx);
  };

  const drawZodiacWheel = (ctx: CanvasRenderingContext2D) => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    // Outer circle
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw zodiac signs
    ZODIAC_SIGNS.forEach((sign, index) => {
      const angle = (index * 30 - 90) * (Math.PI / 180);
      const x = centerX + Math.cos(angle) * radius * 0.85;
      const y = centerY + Math.sin(angle) * radius * 0.85;

      ctx.fillStyle = sign.color;
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign.symbol, x, y);

      // Sign name
      ctx.font = '10px Arial';
      ctx.fillStyle = '#a0aec0';
      const nameX = centerX + Math.cos(angle) * radius * 1.1;
      const nameY = centerY + Math.sin(angle) * radius * 1.1;
      ctx.fillText(sign.name, nameX, nameY);
    });
  };

  const drawHouses = (ctx: CanvasRenderingContext2D) => {
    const centerX = 400;
    const centerY = 300;
    const innerRadius = 140;
    const outerRadius = 200;

    // Draw house lines
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x1 = centerX + Math.cos(angle) * innerRadius;
      const y1 = centerY + Math.sin(angle) * innerRadius;
      const x2 = centerX + Math.cos(angle) * outerRadius;
      const y2 = centerY + Math.sin(angle) * outerRadius;

      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // House numbers
      const houseX = centerX + Math.cos(angle + Math.PI / 12) * (innerRadius + 20);
      const houseY = centerY + Math.sin(angle + Math.PI / 12) * (innerRadius + 20);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText((i + 1).toString(), houseX, houseY);
    }
  };

  const drawAspects = (ctx: CanvasRenderingContext2D) => {
    if (!astrologyData) return;

    astrologyData.aspects.forEach(aspect => {
      const planet1 = astrologyData.planets.find(p => p.name === aspect.planet1);
      const planet2 = astrologyData.planets.find(p => p.name === aspect.planet2);

      if (planet1 && planet2) {
        ctx.strokeStyle = aspect.color + '40';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(planet1.x, planet1.y);
        ctx.lineTo(planet2.x, planet2.y);
        ctx.stroke();

        // Aspect type label at midpoint
        const midX = (planet1.x + planet2.x) / 2;
        const midY = (planet1.y + planet2.y) / 2;
        ctx.fillStyle = aspect.color;
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(aspect.type, midX, midY);
      }
    });
  };

  const drawPlanets = (ctx: CanvasRenderingContext2D) => {
    if (!astrologyData) return;

    astrologyData.planets.forEach(planet => {
      const isHovered = hoveredPlanet === planet.name;
      const time = Date.now() * 0.003;
      const pulse = 1 + 0.2 * Math.sin(time + planet.degree * 0.1);

      // Planet glow
      const gradient = ctx.createRadialGradient(planet.x, planet.y, 0, planet.x, planet.y, 15 * pulse);
      gradient.addColorStop(0, planet.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(planet.x, planet.y, 15 * pulse, 0, 2 * Math.PI);
      ctx.fill();

      // Planet symbol
      ctx.fillStyle = isHovered ? '#ffffff' : planet.color;
      ctx.font = isHovered ? '20px Arial' : '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(planet.symbol, planet.x, planet.y);

      // Planet name and degree
      if (isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.fillText(`${planet.name}`, planet.x, planet.y - 25);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#a0aec0';
        ctx.fillText(`${planet.degree.toFixed(1)}° ${planet.sign}`, planet.x, planet.y + 25);
        ctx.fillText(`House ${planet.house}`, planet.x, planet.y + 35);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!astrologyData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if mouse is over a planet
    let found = false;
    for (const planet of astrologyData.planets) {
      const distance = Math.sqrt(Math.pow(mouseX - planet.x, 2) + Math.pow(mouseY - planet.y, 2));
      if (distance < 20) {
        setHoveredPlanet(planet.name);
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredPlanet(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 text-xl">Loading consciousness field map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ✨ Astrological Consciousness Field
              </h1>
              <p className="text-purple-200">
                Interactive birth chart with live planetary dynamics and consciousness resonance
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-300">Last updated</div>
              <div className="text-xl font-mono text-white">{astrologyData?.lastUpdated}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Chart */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Dynamic Birth Chart</h2>
            <p className="text-purple-200">Hover over planets to see detailed information and aspect connections</p>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              onMouseMove={handleMouseMove}
              className="border border-white/20 rounded-lg cursor-crosshair"
            />
          </div>
        </motion.div>

        {/* Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Planets Legend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🌟</span> Planetary Positions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {astrologyData?.planets.map(planet => (
                <div
                  key={planet.name}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    hoveredPlanet === planet.name ? 'bg-white/20' : 'bg-white/5'
                  }`}
                >
                  <span className="text-lg" style={{ color: planet.color }}>{planet.symbol}</span>
                  <div>
                    <div className="text-white font-semibold">{planet.name}</div>
                    <div className="text-purple-300 text-xs">
                      {planet.degree.toFixed(1)}° {planet.sign} | H{planet.house}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Aspects Legend */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔗</span> Active Aspects
            </h3>
            <div className="space-y-2">
              {astrologyData?.aspects.map((aspect, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <span className="text-white font-semibold">
                      {aspect.planet1} {aspect.type} {aspect.planet2}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-300">Orb: {aspect.orb}°</div>
                    <div className="w-4 h-2 rounded-full" style={{ backgroundColor: aspect.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
          <p className="text-purple-200 text-sm">
            🌌 <strong>Consciousness Astrology:</strong> This field shows planetary energies in dynamic interaction.
            Hover over elements to explore the living cosmos within.
          </p>
        </div>
      </div>
    </div>
  );
}