import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground flex field-sizing-content min-h-28 w-full rounded-xl border bg-card/75 px-3.5 py-2.5 text-base shadow-2xs outline-none transition-[border-color,box-shadow,background-color] duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-border focus-visible:border-primary/55 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-ring aria-invalid:ring-destructive/20 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
