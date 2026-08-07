"use client";

import { useState } from "react";
import { Building2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { AirlineAutocomplete } from "./airline-autocomplete";

interface AirlineSearchFormProps {
  onSearch: (airlineCode: string) => void;
  airlineOptions: Array<{ code: string; label: string }>;
  isLoadingOptions: boolean;
  optionsError: string;
}

export function AirlineSearchForm({
  onSearch,
  airlineOptions,
  isLoadingOptions,
  optionsError,
}: AirlineSearchFormProps) {
  const [airlineQuery, setAirlineQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleAirlineSelect = (airline: { code: string; label: string }) => {
    setAirlineQuery(airline.label.toUpperCase());
    setIsInputFocused(false);
    onSearch(airline.code);
  };

  return (
    <Collapsible className="group/collapsible" render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip="Search by airline" />}
      >
        <Building2 className="size-4 text-chart-2" />
        <span>Airline search</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="relative flex flex-col gap-4 px-2 pt-3 pb-2 group-data-[collapsible=icon]:hidden">
          <div className="flex flex-col gap-2">
            <Label htmlFor="airline-search">Airline (Code or Name)</Label>
            <Input
              id="airline-search"
              type="text"
              placeholder="e.g. KLM, EasyJet, British Airways"
              className="uppercase"
              value={airlineQuery}
              onChange={(e) => setAirlineQuery(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </div>

          {isLoadingOptions ? (
            <p className="text-xs text-muted-foreground">Loading airlines...</p>
          ) : null}
          {optionsError ? (
            <p className="text-xs text-destructive">{optionsError}</p>
          ) : null}

          <AirlineAutocomplete
            options={airlineOptions}
            query={airlineQuery}
            isOpen={isInputFocused}
            onSelect={handleAirlineSelect}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
