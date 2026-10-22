"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_SENTINEL = "__all__";

/**
 * Compact shadcn Select used for client-side facet filters on the
 * opportunity listing pages. Options are derived from the loaded results.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  allLabel?: string;
}) {
  return (
    <Select
      value={value === "" ? ALL_SENTINEL : value}
      onValueChange={(next) => onChange(next === ALL_SENTINEL ? "" : next)}
    >
      <SelectTrigger size="sm" aria-label={label} className="w-auto min-w-[148px] max-w-[220px]">
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_SENTINEL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Sorted, de-duplicated, non-empty values for a facet. */
export function facetOptions<T>(items: T[], pick: (item: T) => string | undefined | null) {
  const set = new Set<string>();
  for (const item of items) {
    const value = pick(item)?.trim();
    if (value) set.add(value);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
