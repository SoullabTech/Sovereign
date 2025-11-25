import * as React from "react"

// Original Button props (preserved for compatibility)
export interface ButtonPropsV1
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

// Union type supporting both versions
export interface ButtonProps extends ButtonPropsV1 {
  // V2 optional props (when uizard_buttons flag is enabled)
  elevation?: 'none' | 'low' | 'medium' | 'high'
  rounded?: 'default' | 'full' | 'none'
  animation?: 'none' | 'subtle' | 'bounce' | 'glow'
  gradient?: boolean
}

// Original Button implementation (preserved exactly)
const ButtonV1 = React.forwardRef<HTMLButtonElement, ButtonPropsV1>(
  ({ className = "", variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    const baseClasses = `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`;

    if (asChild) {
      const child = React.Children.only(props.children);
      return React.cloneElement(child as React.ReactElement, {
        className: baseClasses,
        ...props
      });
    }

    return (
      <button
        className={baseClasses}
        ref={ref}
        {...props}
      />
    )
  }
)

// Smart Button Router - chooses between V1 and V2 based on feature flags
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  // Simplified - always use V1 for compatibility
  const { elevation, rounded, animation, gradient, ...v1Props } = props;
  return <ButtonV1 ref={ref} {...v1Props} />;
})
Button.displayName = "Button"

export { Button }