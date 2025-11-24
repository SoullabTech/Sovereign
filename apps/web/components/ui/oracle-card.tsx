"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useFeatureFlag } from "@/lib/feature-flags";
import { useUizardTracking } from "@/components/analytics/uizard-metrics";

// ========================================
// UIZARD-ENHANCED CARD SYSTEM
// Preserves Oracle identity while adding modern patterns
// ========================================

export interface OracleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // ✅ PRESERVED - Original card functionality
  children?: React.ReactNode;
  className?: string;
  
  // 🆕 UIZARD ENHANCEMENTS - Optional modern improvements
  spacing?: 'compact' | 'comfortable' | 'spacious';
  elevation?: 'none' | 'low' | 'medium' | 'high' | 'mystical';
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'subtle' | 'hover' | 'float';
  mystical?: boolean; // Our unique Oracle enhancement
  gradient?: 'none' | 'subtle' | 'primary' | 'mystical';
  
  // Event handlers for analytics tracking
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export interface OracleCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

export interface OracleCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'compact' | 'comfortable' | 'spacious';
}

// ========================================
// ENHANCED CARD COMPONENT
// ========================================

const OracleCard = React.forwardRef<HTMLDivElement, OracleCardProps>(
  ({ 
    className = "", 
    spacing = 'comfortable',
    elevation = 'medium',
    blur = 'xl',
    animation = 'subtle',
    mystical = false,
    gradient = 'none',
    children,
    onMouseEnter,
    onMouseLeave,
    onClick,
    ...props 
  }, ref) => {
    
    const useUizardSpacing = useFeatureFlag('uizard_components');
    const useEnhancedUI = useFeatureFlag('enhanced_ui_v2');
    
    // Track Uizard enhancement interactions
    const { trackInteraction, trackFeatureExposure } = useUizardTracking('OracleCard');
    
    // Track feature exposure on mount
    React.useEffect(() => {
      trackFeatureExposure('uizard_components', `${spacing}-${elevation}-${animation}`);
    }, [trackFeatureExposure, spacing, elevation, animation]);
    
    // Enhanced event handlers with analytics
    const handleMouseEnter = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (animation !== 'none') {
        trackInteraction(spacing, `hover_enter_${animation}`, {
          elevation,
          gradient,
          mystical,
          blur
        });
      }
      onMouseEnter?.(event);
    }, [onMouseEnter, trackInteraction, spacing, animation, elevation, gradient, mystical, blur]);
    
    const handleMouseLeave = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (animation !== 'none') {
        trackInteraction(spacing, `hover_leave_${animation}`, {
          elevation
        });
      }
      onMouseLeave?.(event);
    }, [onMouseLeave, trackInteraction, spacing, animation, elevation]);
    
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      trackInteraction(spacing, `click_${animation}`, {
        elevation,
        gradient,
        mystical
      });
      onClick?.(event);
    }, [onClick, trackInteraction, spacing, animation, elevation, gradient, mystical]);
    
    // Use enhanced spacing if flags are enabled
    const useEnhancements = useUizardSpacing || useEnhancedUI;
    
    // ✅ PRESERVED - Original spacing as default
    const spacingClasses = {
      compact: useEnhancements ? 'p-4' : 'p-4',       // Original p-4
      comfortable: useEnhancements ? 'p-6' : 'p-6',   // Original p-6 (unchanged)  
      spacious: useEnhancements ? 'p-8' : 'p-6'       // Enhanced p-8 when enabled
    };
    
    // 🆕 UIZARD ENHANCEMENT - Modern elevation system
    const elevationClasses = {
      none: '',
      low: 'shadow-sm',
      medium: 'shadow-md',
      high: 'shadow-lg',
      mystical: 'shadow-lg shadow-amber-500/20' // Oracle-themed shadow
    };
    
    // ✅ PRESERVED - Our signature glassmorphic blur
    const blurClasses = {
      none: '',
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md', 
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl'    // Our current default
    };
    
    // 🆕 UIZARD ENHANCEMENT - Optional gradient backgrounds
    const gradientClasses = {
      none: 'bg-background/80',  // Our current default
      subtle: 'bg-gradient-to-br from-background/80 to-background/60',
      primary: 'bg-gradient-to-br from-amber-900/20 via-background/80 to-slate-900/90',
      mystical: 'bg-gradient-to-br from-amber-900/30 via-indigo-900/20 to-orange-900/10'
    };
    
    // Build the className with all enhancements
    const baseClasses = `
      rounded-xl 
      border border-amber-500/20 
      ${gradientClasses[gradient]}
      ${blurClasses[blur]}
      ${elevationClasses[elevation]}
      ${spacingClasses[spacing]}
      ${mystical ? 'ring-1 ring-amber-400/30' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Animation wrapper based on animation prop
    const CardElement = ({ children, ...cardProps }: any) => {
      if (animation === 'none' || !useEnhancements) {
        return <div {...cardProps}>{children}</div>;
      }

      const animationProps = {
        subtle: {
          whileHover: { scale: 1.01 },
          transition: { type: "spring", stiffness: 400, damping: 17 }
        },
        hover: {
          whileHover: { 
            scale: 1.02, 
            y: -2,
            boxShadow: "0 10px 25px rgba(139, 92, 246, 0.1)"
          },
          transition: { type: "spring", stiffness: 300, damping: 20 }
        },
        float: {
          animate: { 
            y: [0, -2, 0],
          },
          transition: { 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          },
          whileHover: { scale: 1.02 }
        }
      };

      return (
        <motion.div {...animationProps[animation]} {...cardProps}>
          {children}
        </motion.div>
      );
    };

    return (
      <CardElement
        ref={ref}
        className={baseClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      >
        {children}
      </CardElement>
    );
  }
);
OracleCard.displayName = "OracleCard";

// ========================================
// ENHANCED HEADER COMPONENT
// ========================================

const OracleCardHeader = React.forwardRef<HTMLDivElement, OracleCardHeaderProps>(
  ({ className = "", spacing = 'comfortable', ...props }, ref) => {
    const useUizardSpacing = useFeatureFlag('uizard_components');
    
    // Enhanced spacing when feature flag is enabled
    const spacingClasses = {
      compact: useUizardSpacing ? 'pb-3' : 'pb-2',
      comfortable: useUizardSpacing ? 'pb-4' : 'pb-3',    // Slight improvement
      spacious: useUizardSpacing ? 'pb-6' : 'pb-4'
    };
    
    return (
      <div
        ref={ref}
        className={`flex flex-col space-y-1.5 ${spacingClasses[spacing]} ${className}`}
        {...props}
      />
    );
  }
);
OracleCardHeader.displayName = "OracleCardHeader";

// ========================================
// ENHANCED TITLE COMPONENT
// ========================================

const OracleCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { mystical?: boolean }
>(({ className = "", mystical = false, ...props }, ref) => {
  const titleClasses = mystical 
    ? `text-xl font-semibold leading-none tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent ${className}`
    : `text-xl font-semibold leading-none tracking-tight text-white ${className}`;
  
  return (
    <h3
      ref={ref}
      className={titleClasses}
      {...props}
    />
  );
});
OracleCardTitle.displayName = "OracleCardTitle";

// ========================================
// ENHANCED DESCRIPTION COMPONENT  
// ========================================

const OracleCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground leading-relaxed ${className}`}
    {...props}
  />
));
OracleCardDescription.displayName = "OracleCardDescription";

// ========================================
// ENHANCED CONTENT COMPONENT
// ========================================

const OracleCardContent = React.forwardRef<HTMLDivElement, OracleCardContentProps>(
  ({ className = "", spacing = 'comfortable', ...props }, ref) => {
    const useUizardSpacing = useFeatureFlag('uizard_components');
    
    // No top padding since we want content to flow from header
    const spacingClasses = {
      compact: useUizardSpacing ? '' : '',           // No change needed
      comfortable: useUizardSpacing ? 'pt-1' : '',   // Slight improvement
      spacious: useUizardSpacing ? 'pt-2' : 'pt-1'   // More breathing room
    };
    
    return (
      <div 
        ref={ref} 
        className={`${spacingClasses[spacing]} ${className}`} 
        {...props} 
      />
    );
  }
);
OracleCardContent.displayName = "OracleCardContent";

// ========================================
// ENHANCED FOOTER COMPONENT
// ========================================

const OracleCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: 'compact' | 'comfortable' | 'spacious' }
>(({ className = "", spacing = 'comfortable', ...props }, ref) => {
  const useUizardSpacing = useFeatureFlag('uizard_components');
  
  const spacingClasses = {
    compact: useUizardSpacing ? 'pt-3' : 'pt-2',
    comfortable: useUizardSpacing ? 'pt-4' : 'pt-3',
    spacious: useUizardSpacing ? 'pt-6' : 'pt-4'
  };
  
  return (
    <div
      ref={ref}
      className={`flex items-center ${spacingClasses[spacing]} ${className}`}
      {...props}
    />
  );
});
OracleCardFooter.displayName = "OracleCardFooter";

// ========================================
// PRESET ORACLE CARD VARIANTS
// ========================================

// Mystical variant for spiritual content
export const MysticalCard = React.forwardRef<HTMLDivElement, OracleCardProps>(
  (props, ref) => (
    <OracleCard
      ref={ref}
      mystical={true}
      gradient="mystical"
      elevation="mystical"
      animation="float"
      {...props}
    />
  )
);
MysticalCard.displayName = "MysticalCard";

// Compact variant for dashboard widgets  
export const DashboardCard = React.forwardRef<HTMLDivElement, OracleCardProps>(
  (props, ref) => (
    <OracleCard
      ref={ref}
      spacing="comfortable"
      elevation="medium"
      animation="hover"
      {...props}
    />
  )
);
DashboardCard.displayName = "DashboardCard";

// Spacious variant for main content
export const ContentCard = React.forwardRef<HTMLDivElement, OracleCardProps>(
  (props, ref) => (
    <OracleCard
      ref={ref}
      spacing="spacious"
      gradient="subtle"
      elevation="low"
      animation="subtle"
      {...props}
    />
  )
);
ContentCard.displayName = "ContentCard";

export { 
  OracleCard, 
  OracleCardHeader, 
  OracleCardFooter, 
  OracleCardTitle, 
  OracleCardDescription, 
  OracleCardContent 
};