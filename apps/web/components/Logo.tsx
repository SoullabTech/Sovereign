import React from "react";
import { motion } from "framer-motion";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  state?: "idle" | "thinking" | "responding";
}

export default function Logo({ size = "md", showText = true, className = "", state = "idle" }: LogoProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-sm",
    md: "w-16 h-16 text-lg", 
    lg: "w-24 h-24 text-2xl"
  };

  const textSizeMap = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  // Animation variants for different states
  const getLogoAnimation = () => {
    switch (state) {
      case "thinking":
        return {
          rotate: 360,
          scale: [1, 1.05, 1],
        };
      case "responding":
        return {
          scale: [1, 1.1, 1],
          opacity: [1, 0.8, 1],
        };
      case "idle":
      default:
        return {
          scale: [1, 1.05, 1],
        };
    }
  };

  const getTransition = () => {
    switch (state) {
      case "thinking":
        return {
          rotate: { duration: 6, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        };
      case "responding":
        return {
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        };
      case "idle":
      default:
        return {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        };
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo Circle */}
      <motion.div 
        animate={getLogoAnimation()}
        transition={getTransition()}
        className={`bg-gradient-to-br from-gold-divine to-amber-500 rounded-full flex items-center justify-center ${sizeMap[size]} shadow-lg`}
      >
        <span className="text-white font-bold drop-shadow-md">SL</span>
      </motion.div>
      
      {/* Logo Text */}
      {showText && (
        <div className={`mt-2 font-light text-gray-900 ${textSizeMap[size]} tracking-wide`}>
          Soul<span className="font-normal">lab</span><span className="text-blue-600 text-sm">®</span>
        </div>
      )}
    </div>
  );
}