"use client"

import { useState } from "react"
import { Building2, ChevronRight, Plane, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { AirlineOption } from "@/lib/types/flight"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"

interface FlightSearchSidebarProps {
  onSearch: (flightNumber: string) => void
  onAirlineSearch: (airlineCode: string) => void
  airlineOptions: AirlineOption[]
  isLoadingAirlineOptions: boolean
  airlineOptionsError: string
}

export function FlightSearchSidebar({
  onSearch,
  onAirlineSearch,
  airlineOptions,
  isLoadingAirlineOptions,
  airlineOptionsError,
}: FlightSearchSidebarProps) {
  const [flightNumber, setFlightNumber] = useState("")
  const [airlineQuery, setAirlineQuery] = useState("")
  const [isAirlineInputFocused, setIsAirlineInputFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!flightNumber.trim()) return
    onSearch(flightNumber.toUpperCase())
  }

  const normalizedAirlineQuery = airlineQuery.trim().toUpperCase()
  const isAirlineDropdownOpen =
    isAirlineInputFocused && normalizedAirlineQuery.length >= 3
  const filteredAirlines =
    normalizedAirlineQuery.length >= 3
      ? airlineOptions
          .filter((airline) => {
            const haystack = `${airline.code} ${airline.label}`.toUpperCase()
            return haystack.includes(normalizedAirlineQuery)
          })
          .slice(0, 30)
      : []

  const handleAirlineOptionSelect = (airline: AirlineOption) => {
    setAirlineQuery(airline.label.toUpperCase())
    setIsAirlineInputFocused(false)
    onAirlineSearch(airline.code)
  }

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
              <Plane className="size-4" />
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
              <Collapsible
                defaultOpen
                className="group/collapsible"
                render={<SidebarMenuItem />}
              >
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip="Search by flight number" />}
                >
                  <Search className="size-4" />
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

              <Collapsible className="group/collapsible" render={<SidebarMenuItem />}>
                <CollapsibleTrigger
                  render={<SidebarMenuButton tooltip="Search by airline" />}
                >
                  <Building2 className="size-4" />
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
                        onFocus={() => setIsAirlineInputFocused(true)}
                        onBlur={() => setIsAirlineInputFocused(false)}
                      />
                    </div>

                    {isLoadingAirlineOptions ? (
                      <p className="text-xs text-muted-foreground">Loading airlines...</p>
                    ) : null}
                    {airlineOptionsError ? (
                      <p className="text-xs text-destructive">{airlineOptionsError}</p>
                    ) : null}

                    {isAirlineDropdownOpen && normalizedAirlineQuery.length >= 3 ? (
                      <div className="absolute top-[88px] z-20 max-h-72 w-[calc(100%-1rem)] overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md">
                        {filteredAirlines.length ? (
                          filteredAirlines.map((airline) => (
                            <button
                              key={`${airline.code}-${airline.label}`}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault()
                                handleAirlineOptionSelect(airline)
                              }}
                              className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
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
                    ) : null}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
