import React from "react";

// Simple element icons using Unicode symbols and CSS
export function ElementIcon({ type, className = "w-5 h-5" }: { 
  type: "fire" | "water" | "earth" | "air" | "aether"; 
  className?: string;
}) {
  const iconMap = {
    fire: { symbol: "🔥", color: "text-red-500" },
    water: { symbol: "💧", color: "text-blue-500" },
    earth: { symbol: "🌱", color: "text-green-500" },
    air: { symbol: "💨", color: "text-indigo-500" },
    aether: { symbol: "✨", color: "text-amber-500" }
  };

  const icon = iconMap[type];

  return (
    <span 
      className={`inline-flex items-center justify-center ${className} ${icon.color}`}
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {icon.symbol}
    </span>
  );
}

// Alternative text-based icons for more professional look
export function ElementIconText({ type }: { type: "fire" | "water" | "earth" | "air" | "aether" }) {
  const iconMap = {
    fire: { initial: "F", color: "bg-red-100 text-red-600 border-red-200" },
    water: { initial: "W", color: "bg-blue-100 text-blue-600 border-blue-200" },
    earth: { initial: "E", color: "bg-green-100 text-green-600 border-green-200" },
    air: { initial: "A", color: "bg-indigo-100 text-indigo-600 border-indigo-200" },
    aether: { initial: "S", color: "bg-amber-100 text-amber-600 border-amber-200" }
  };

  const icon = iconMap[type];

  return (
    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-sm font-semibold ${icon.color}`}>
      {icon.initial}
    </div>
  );
}