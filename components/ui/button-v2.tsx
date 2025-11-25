"use client";

import * as React from "react"
import { motion } from "framer-motion"
import { useUizardTracking } from "@/components/analytics/uizard-metrics"

// PRESERVE ORIGINAL API - All existing props must work identically
export interface ButtonPropsV2
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // ✅ PRESERVED - Original props (DO NOT CHANGE)
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  
  // ✅ NEW - Uizard enhancement props (OPTIONAL)
  elevation?: 'none' | 'low' | 'medium' | 'high'
  rounded?: 'default' | 'full' | 'none'
  animation?: 'none' | 'subtle' | 'bounce' | 'glow'
  gradient?: boolean
}

const ButtonV2 = React.forwardRef<HTMLButtonElement, ButtonPropsV2>(
  ({ 
    className = "", 
    variant = 'default', 
    size = 'default', 
    asChild = false,
    // New Uizard enhancement props with safe defaults
    elevation = 'low',
    rounded = 'default',
    animation = 'subtle',
    gradient = false,
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...props 
  }, ref) => {
    
    // Track Uizard enhancement interactions
    const { trackInteraction, trackFeatureExposure } = useUizardTracking('ButtonV2');
    
    // Track feature exposure on mount
    React.useEffect(() => {
      trackFeatureExposure('uizard_buttons', `${variant}-${size}`);
    }, [trackFeatureExposure, variant, size]);
    
    // Enhanced event handlers with analytics
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      trackInteraction(variant, `click_${animation}`, {
        elevation,
        rounded,
        gradient,
        size
      });
      onClick?.(event);
    }, [onClick, trackInteraction, variant, animation, elevation, rounded, gradient, size]);
    
    const handleMouseEnter = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      trackInteraction(variant, `hover_enter_${animation}`, {
        elevation,
        timestamp: Date.now()
      });
      onMouseEnter?.(event);
    }, [onMouseEnter, trackInteraction, variant, animation, elevation]);
    
    const handleMouseLeave = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      trackInteraction(variant, `hover_leave_${animation}`, {
        elevation
      });
      onMouseLeave?.(event);
    }, [onMouseLeave, trackInteraction, variant, animation, elevation]);
    
    // ✅ PRESERVED - Original variant system (UNCHANGED)
    const baseVariants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }

    // ✅ ENHANCED - Oracle spacing system integration (backward compatible)
    const sizes = {
      default: "h-11 px-6 py-2",      // Enhanced from oracle-spacing.css
      sm: "h-9 px-4",                // Enhanced padding
      lg: "h-13 px-8",               // Enhanced height
      icon: "h-11 w-11",             // Enhanced icon size
    }

    // 🆕 ENHANCED - Uizard-inspired elevation system
    const elevations = {
      none: "",
      low: "shadow-sm hover:shadow-md",
      medium: "shadow-md hover:shadow-lg",
      high: "shadow-lg hover:shadow-xl drop-shadow-lg",
    }

    // 🆕 ENHANCED - Uizard-inspired rounded options
    const roundedOptions = {
      none: "rounded-none",
      default: "rounded-md",
      full: "rounded-full",
    }

    // 🆕 ENHANCED - Oracle-themed gradient overlays
    const gradientOverlays = {
      default: "bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600",
      destructive: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
      outline: "", // No gradient for outline
      secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
      ghost: "", // No gradient for ghost
      link: "", // No gradient for link
    }

    // Build className with enhancements
    const variantClass = gradient && gradientOverlays[variant] 
      ? gradientOverlays[variant] 
      : baseVariants[variant];
    
    const baseClasses = `
      inline-flex items-center justify-center whitespace-nowrap text-sm font-medium 
      ring-offset-background transition-all duration-200 ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50
      ${variantClass}
      ${sizes[size]}
      ${elevations[elevation]}
      ${roundedOptions[rounded]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Animation wrapper based on animation prop
    const ButtonElement = ({ children, ...buttonProps }: any) => {
      if (animation === 'none') {
        return <button {...buttonProps}>{children}</button>;
      }

      const animationProps = {
        subtle: {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { type: "spring", stiffness: 400, damping: 17 }
        },
        bounce: {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { type: "spring", stiffness: 300, damping: 10 }
        },
        glow: {
          whileHover: { 
            scale: 1.02,
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
          },
          whileTap: { scale: 0.98 },
          transition: { duration: 0.2 }
        }
      };

      return (
        <motion.button {...animationProps[animation]} {...buttonProps}>
          {children}
        </motion.button>
      );
    };

    // ✅ PRESERVED - Original asChild logic (UNCHANGED)
    if (asChild) {
      const child = React.Children.only(props.children);
      return React.cloneElement(child as React.ReactElement, {
        className: baseClasses,
        ...props
      });
    }

    return (
      <ButtonElement
        className={baseClasses}
        ref={ref}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      />
    )
  }
)
ButtonV2.displayName = "ButtonV2"

export { ButtonV2 }