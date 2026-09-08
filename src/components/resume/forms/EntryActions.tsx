"use client";

import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Edit / move up / move down / delete controls for one row of a resume
 * section list. Shared by the education, experience, and achievements forms.
 */
export function EntryActions({
  index,
  count,
  onEdit,
  onMove,
  onDelete,
  editing,
}: {
  index: number;
  count: number;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  editing?: boolean;
}) {
  const base =
    "rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Move up"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        className={base}
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        className={base}
      >
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Edit"
        onClick={onEdit}
        className={cn(base, editing && "bg-primary/10 text-primary")}
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Delete"
        onClick={onDelete}
        className={cn(base, "hover:bg-destructive/10 hover:text-destructive")}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Immutable helpers shared by the list forms. */
export function moveItem<T>(list: T[], from: number, direction: -1 | 1): T[] {
  const to = from + direction;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

export function removeItem<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function replaceItem<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}
