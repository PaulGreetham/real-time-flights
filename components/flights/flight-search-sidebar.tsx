"use client"

import { useState } from "react"
import { ChevronRight, Plane, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

interface FlightSearchSidebarProps {
  onSearch: (flightNumber: string) => void
}

export function FlightSearchSidebar({ onSearch }: FlightSearchSidebarProps) {
  const [flightNumber, setFlightNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!flightNumber.trim()) return
    onSearch(flightNumber.toUpperCase())
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
            <SidebarMenu>
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
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        render={<button type="button" />}
                        className="cursor-default hover:bg-transparent active:bg-transparent"
                      >
                        <span>Track Live Flight</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 px-2 pb-1 group-data-[collapsible=icon]:hidden"
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
