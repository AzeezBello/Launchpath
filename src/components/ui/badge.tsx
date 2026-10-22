import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap [&>svg]:size-3 [&>svg]:pointer-events-none focus-visible:ring-[3px] focus-visible:ring-ring/70 aria-invalid:ring-destructive/20 aria-invalid:border-destructive transition-[color,background-color,border-color,box-shadow] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/12 text-primary [a&]:hover:bg-primary/18",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/85",
        destructive:
          "border-destructive/20 bg-destructive/12 text-destructive [a&]:hover:bg-destructive/18 focus-visible:ring-destructive/20",
        success:
          "border-success/20 bg-success/12 text-success [a&]:hover:bg-success/18",
        warning:
          "border-warning/25 bg-warning/15 text-warning-foreground dark:text-warning [a&]:hover:bg-warning/22",
        info:
          "border-info/20 bg-info/12 text-info [a&]:hover:bg-info/18",
        outline:
          "border-border/85 bg-card/75 text-foreground shadow-2xs [a&]:hover:bg-accent/70 [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
