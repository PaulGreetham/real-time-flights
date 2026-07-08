import { Plane } from "lucide-react"

interface FlightResultsPanelProps {
  activeFlight: string | null
}

export function FlightResultsPanel({ activeFlight }: FlightResultsPanelProps) {
  return (
    <main className="p-8 flex items-center justify-center bg-background">
      {activeFlight ? (
        <div className="text-center max-w-md animate-in fade-in duration-300">
          <h2 className="text-2xl font-bold tracking-tight">Tracking Flight {activeFlight}</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Connecting to live radar feed... Flight data dashboard rendering here.
          </p>
        </div>
      ) : (
        <div className="text-center max-w-md">
          <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Plane className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">No Active Flight Selected</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter a valid flight number in the left panel to display radar routing and schedules.
          </p>
        </div>
      )}
    </main>
  )
}
