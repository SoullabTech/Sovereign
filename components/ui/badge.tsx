import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = 'default', ...props }, ref) => {
    const variants = {
      default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
      success: "border-transparent bg-green-500/20 text-green-400 hover:bg-green-500/30",
      warning: "border-transparent bg-orange-500/20 text-orange-400 hover:bg-orange-500/30",
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

// Archetype-specific badge
export interface ArchetypeBadgeProps extends BadgeProps {
  archetype: 'sage' | 'seeker' | 'healer' | 'creator' | 'rebel' | 'ruler'
}

const ArchetypeBadge = React.forwardRef<HTMLDivElement, ArchetypeBadgeProps>(
  ({ archetype, ...props }, ref) => {
    const archetypeColors = {
      sage: 'bg-blue-500/20 text-blue-400',
      seeker: 'bg-amber-500/20 text-amber-400',
      healer: 'bg-green-500/20 text-green-400', 
      creator: 'bg-orange-500/20 text-orange-400',
      rebel: 'bg-red-500/20 text-red-400',
      ruler: 'bg-yellow-500/20 text-yellow-400'
    }
    
    return (
      <Badge 
        ref={ref} 
        className={`${archetypeColors[archetype]} capitalize`}
        {...props}
      >
        {archetype}
      </Badge>
    )
  }
)
ArchetypeBadge.displayName = "ArchetypeBadge"

// Count badge
export interface CountBadgeProps extends BadgeProps {
  count: number
  max?: number
}

const CountBadge = React.forwardRef<HTMLDivElement, CountBadgeProps>(
  ({ count, max, ...props }, ref) => {
    const percentage = max ? (count / max) * 100 : 100
    const variant = percentage > 80 ? 'success' : percentage > 40 ? 'warning' : 'destructive'
    
    return (
      <Badge 
        ref={ref} 
        variant={variant}
        {...props}
      >
        {max ? `${count}/${max}` : count}
      </Badge>
    )
  }
)
CountBadge.displayName = "CountBadge"

export { Badge, ArchetypeBadge, CountBadge }