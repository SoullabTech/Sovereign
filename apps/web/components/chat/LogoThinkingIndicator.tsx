'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ThinkingState } from './types';

interface LogoThinkingIndicatorProps {
  state: ThinkingState;
  isMobile?: boolean;
  size?: number;
}

export default function LogoThinkingIndicator({ 
  state = 'idle', 
  isMobile = false,
  size = 48
}: LogoThinkingIndicatorProps) {
  const iconSize = size * 0.67; // Logo is ~2/3 of container size
  
  const getAnimationProps = () => {
    switch (state) {
      case 'thinking':
        return {
          animate: {
            rotate: 360,
            scale: [1, 1.1, 1],
            filter: [
              'hue-rotate(0deg) brightness(1)',
              'hue-rotate(120deg) brightness(1.2)',
              'hue-rotate(360deg) brightness(1)'
            ]
          },
          transition: {
            rotate: {
              duration: 3,
              ease: 'linear',
              repeat: Infinity
            },
            scale: {
              duration: 3,
              ease: 'easeInOut',
              repeat: Infinity
            },
            filter: {
              duration: 3,
              ease: 'easeInOut',
              repeat: Infinity
            }
          }
        };
        
      case 'responding':
        return {
          animate: {
            scale: [1, 1.15, 1],
            opacity: [0.9, 1, 0.9]
          },
          transition: {
            duration: 0.8,
            ease: 'easeInOut',
            repeat: Infinity
          }
        };
        
      default: // idle
        return {
          animate: {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          },
          transition: {
            duration: 2,
            ease: 'easeInOut',
            repeat: Infinity
          }
        };
    }
  };

  const containerAnimation = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: { duration: 0.3 }
  };

  return (
    <>
      <style jsx>{`
        .logo-thinking-container {
          position: fixed;
          top: ${isMobile ? '20px' : '24px'};
          left: 50%;
          transform: translateX(-50%);
          width: ${size}px;
          height: ${size}px;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        
        .spiral-icon {
          width: ${iconSize}px;
          height: ${iconSize}px;
          filter: drop-shadow(0 2px 8px rgba(255, 215, 0, 0.3));
        }
        
        .state-idle {
          color: #FFD700;
        }
        
        .state-thinking {
          color: #FFD700;
        }
        
        .state-responding {
          color: #B57EDC;
        }
        
        /* Sacred glow rings for different states */
        .glow-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid;
          opacity: 0.3;
          animation: glow-ring-pulse 4s ease-in-out infinite;
        }
        
        .glow-ring-1 {
          width: ${size + 20}px;
          height: ${size + 20}px;
          border-color: rgba(255, 215, 0, 0.4);
          animation-delay: 0s;
        }
        
        .glow-ring-2 {
          width: ${size + 40}px;
          height: ${size + 40}px;
          border-color: rgba(255, 215, 0, 0.2);
          animation-delay: 1s;
        }
        
        @keyframes glow-ring-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
        }
        
        /* Special effects for different states */
        .thinking-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
        }
        
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #FFD700;
          border-radius: 50%;
          animation: particle-orbit 4s linear infinite;
        }
        
        .particle-1 { animation-delay: 0s; }
        .particle-2 { animation-delay: 1s; }
        .particle-3 { animation-delay: 2s; }
        .particle-4 { animation-delay: 3s; }
        
        @keyframes particle-orbit {
          0% {
            transform: rotate(0deg) translateX(${size/2 + 10}px) rotate(0deg);
            opacity: 0;
          }
          10%, 90% {
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg) translateX(${size/2 + 10}px) rotate(-360deg);
            opacity: 0;
          }
        }
        
        /* Breathing indicator for idle state */
        .breathing-indicator {
          position: absolute;
          bottom: -${size/2 + 20}px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: rgba(255, 215, 0, 0.6);
          font-family: 'Lato', sans-serif;
          text-align: center;
          opacity: 0;
          animation: breathing-text 8s ease-in-out infinite;
        }
        
        @keyframes breathing-text {
          0%, 80%, 100% { opacity: 0; }
          10%, 70% { opacity: 0.6; }
        }
      `}</style>
      
      <motion.div 
        className="logo-thinking-container"
        {...containerAnimation}
      >
        {/* Sacred Glow Rings - only show when thinking */}
        {state === 'thinking' && (
          <>
            <div className="glow-ring glow-ring-1" />
            <div className="glow-ring glow-ring-2" />
          </>
        )}
        
        {/* Thinking Particles - only show when thinking */}
        {state === 'thinking' && (
          <div className="thinking-particles">
            <div className="particle particle-1" />
            <div className="particle particle-2" />
            <div className="particle particle-3" />
            <div className="particle particle-4" />
          </div>
        )}
        
        {/* Sacred Spiral Logo */}
        <motion.div
          className={`spiral-icon state-${state}`}
          {...getAnimationProps()}
        >
          {/* Sacred Logo SVG */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Circle */}
            <circle 
              cx="24" 
              cy="24" 
              r="22" 
              stroke="currentColor" 
              strokeWidth="1" 
              opacity="0.6"
            />
            
            {/* Sacred Triangle */}
            <path 
              d="M24 6 L41.32 36 L6.68 36 Z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
            />
            
            {/* Inner Circle */}
            <circle 
              cx="24" 
              cy="24" 
              r="12" 
              stroke="currentColor" 
              strokeWidth="1" 
              opacity="0.8"
            />
            
            {/* Center Point */}
            <circle 
              cx="24" 
              cy="24" 
              r="2" 
              fill="currentColor"
            />
            
            {/* Sacred Geometry Lines */}
            <line 
              x1="24" 
              y1="6" 
              x2="24" 
              y2="42" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              opacity="0.4"
            />
            <line 
              x1="6.68" 
              y1="36" 
              x2="41.32" 
              y2="36" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              opacity="0.4"
            />
            <line 
              x1="6.68" 
              y1="36" 
              x2="24" 
              y2="6" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              opacity="0.4"
            />
            <line 
              x1="41.32" 
              y1="36" 
              x2="24" 
              y2="6" 
              stroke="currentColor" 
              strokeWidth="0.5" 
              opacity="0.4"
            />
            
            {/* Corner Dots */}
            <circle 
              cx="24" 
              cy="6" 
              r="1.5" 
              fill="currentColor" 
              opacity="0.8"
            />
            <circle 
              cx="6.68" 
              cy="36" 
              r="1.5" 
              fill="currentColor" 
              opacity="0.8"
            />
            <circle 
              cx="41.32" 
              cy="36" 
              r="1.5" 
              fill="currentColor" 
              opacity="0.8"
            />
          </svg>
        </motion.div>
        
        {/* Breathing Indicator Text - only show when idle */}
        {state === 'idle' && !isMobile && (
          <div className="breathing-indicator">
            Present
          </div>
        )}
      </motion.div>
    </>
  );
}