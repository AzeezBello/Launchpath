"use client";

/**
 * Compact native select used for client-side facet filters on the
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
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 max-w-[220px] rounded-xl border border-input bg-background/60 px-3 text-xs text-foreground shadow-sm outline-none focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <option value="" className="bg-background text-foreground">
        {allLabel}
      </option>
      {options.map((option) => (
        <option key={option} value={option} className="bg-background text-foreground">
          {option}
        </option>
      ))}
    </select>
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
