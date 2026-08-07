"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";

interface FlightSearchFormProps {
  onSearch: (flightNumber: string) => void;
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [flightNumber, setFlightNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber.trim()) return;
    onSearch(flightNumber.toUpperCase());
  };

  return (
    <Collapsible
      defaultOpen
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={<SidebarMenuButton tooltip="Search by flight number" />}
      >
        <Search className="size-4 text-primary" />
        <span>Search Flight</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-2 pt-3 pb-2 group-data-[collapsible=icon]:hidden"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="flight-search">Flight Number</Label>
            <Input
              id="flight-search"
              type="text"
              placeholder="e.g. AA123, DL456"
              className="uppercase"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            Locate Aircraft
          </Button>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
