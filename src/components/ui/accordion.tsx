"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type AccordionContextValue = {
  openValues: string[]
  toggleValue: (value: string) => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)
const AccordionItemContext = React.createContext<{ value: string; isOpen: boolean } | null>(null)

function Accordion({
  type = "single",
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}) {
  const [internal, setInternal] = React.useState<string[]>(() => {
    if (defaultValue === undefined) return []
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue]
  })

  const openValues = React.useMemo(() => {
    if (value === undefined) return internal
    return Array.isArray(value) ? value : value ? [value] : []
  }, [value, internal])

  const toggleValue = React.useCallback(
    (itemValue: string) => {
      const exists = openValues.includes(itemValue)
      let next: string[]
      if (type === "multiple") {
        next = exists ? openValues.filter((v) => v !== itemValue) : [...openValues, itemValue]
      } else {
        if (exists) {
          next = collapsible ? [] : openValues
        } else {
          next = [itemValue]
        }
      }
      if (value === undefined) setInternal(next)
      onValueChange?.(type === "multiple" ? next : (next[0] ?? ""))
    },
    [openValues, type, collapsible, value, onValueChange]
  )

  return (
    <AccordionContext.Provider value={{ openValues, toggleValue }}>
      <div data-slot="accordion" className={cn("space-y-3", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(AccordionContext)
  const isOpen = Boolean(ctx?.openValues.includes(value))

  return (
    <AccordionItemContext.Provider value={{ value, isOpen }}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "rounded-2xl border border-border/85 bg-card/90 px-5 transition-[border-color,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=open]:border-primary/25 data-[state=open]:bg-card data-[state=open]:shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const accordion = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)
  const isOpen = Boolean(item?.isOpen)

  return (
    <h3 className="flex">
      <button
        type="button"
        data-slot="accordion-trigger"
        data-state={isOpen ? "open" : "closed"}
        aria-expanded={isOpen}
        onClick={() => item && accordion?.toggleValue(item.value)}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-between gap-4 py-4 text-left text-base font-semibold tracking-tight text-foreground outline-none transition-colors duration-160 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring rounded-lg",
          className
        )}
        {...props}
      >
        <span>{children}</span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/70 text-muted-foreground rotate-0 transition-[rotate,background-color,color,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
            isOpen && "rotate-180 border-primary/25 bg-primary/10 text-primary"
          )}
        >
          <ChevronDown className="size-4" />
        </span>
      </button>
    </h3>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const item = React.useContext(AccordionItemContext)
  const isOpen = Boolean(item?.isOpen)

  return (
    <div
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      aria-hidden={!isOpen}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-220 ease-[cubic-bezier(0.23,1,0.32,1)]",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("pb-5 pt-0.5 text-sm leading-relaxed text-muted-foreground", className)}>
          {children}
        </div>
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
