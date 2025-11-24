import React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border border-border bg-background text-foreground ${className}`}
      {...props}
    />
  )
)

Card.displayName = "Card"

export { Card }
