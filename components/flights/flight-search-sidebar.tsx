"use client";

import { Plane } from "lucide-react";
import type { AirlineOption } from "@/lib/types/flight";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { FlightSearchForm } from "./flight-search-form";
import { AirlineSearchForm } from "./airline-search-form";

interface FlightSearchSidebarProps {
  onSearch: (flightNumber: string) => void;
  onAirlineSearch: (airlineCode: string) => void;
  airlineOptions: AirlineOption[];
  isLoadingAirlineOptions: boolean;
  airlineOptionsError: string;
}

export function FlightSearchSidebar({
  onSearch,
  onAirlineSearch,
  airlineOptions,
  isLoadingAirlineOptions,
  airlineOptionsError,
}: FlightSearchSidebarProps) {

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Real-Time Flights"
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Plane className="size-4 text-primary" />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">Real-Time Flights</span>
                <span className="truncate text-xs text-muted-foreground">Live tracking</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Flight Search</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              <FlightSearchForm onSearch={onSearch} />
              <AirlineSearchForm
                onSearch={onAirlineSearch}
                airlineOptions={airlineOptions}
                isLoadingOptions={isLoadingAirlineOptions}
                optionsError={airlineOptionsError}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
