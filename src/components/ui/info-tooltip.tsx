"use client";

import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Small "(i)" affordance for explaining a non-obvious control or metric inline,
// without cluttering the surrounding copy.
export function InfoTooltip({ text, className }: { text: string; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="More info"
          className={cn(
            "size-5 rounded-full p-0 text-muted-foreground/80 hover:bg-accent/60 hover:text-foreground",
            className
          )}
        >
          <Info className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
