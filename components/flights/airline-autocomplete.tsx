"use client";

interface AirlineAutocompleteProps {
  options: Array<{ code: string; label: string }>;
  query: string;
  isOpen: boolean;
  onSelect: (option: { code: string; label: string }) => void;
}

export function AirlineAutocomplete({
  options,
  query,
  isOpen,
  onSelect,
}: AirlineAutocompleteProps) {
  if (!isOpen || query.length < 3) {
    return null;
  }

  const normalizedQuery = query.trim().toUpperCase();
  const filteredOptions = options
    .filter((airline) => {
      const haystack = `${airline.code} ${airline.label}`.toUpperCase();
      return haystack.includes(normalizedQuery);
    })
    .slice(0, 30);

  return (
    <div className="absolute top-[88px] z-20 max-h-72 w-[calc(100%-1rem)] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
      {filteredOptions.length ? (
        filteredOptions.map((airline) => (
          <button
            key={`${airline.code}-${airline.label}`}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(airline);
            }}
            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
          >
            {airline.label}
          </button>
        ))
      ) : (
        <p className="px-2 py-1.5 text-xs text-muted-foreground">
          No airline matches found.
        </p>
      )}
    </div>
  );
}
