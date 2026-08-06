import Link from "next/link";
import { Activity, Clock3, Globe2, Sparkles, Waves } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "Live Aircraft Positioning",
    description:
      "Watch current aircraft coordinates refresh in near real-time with route context.",
    icon: Activity,
  },
  {
    title: "Airline-Level Discovery",
    description:
      "Search by airline to inspect active flights and jump directly into specific routes.",
    icon: Globe2,
  },
  {
    title: "Dynamic Map Visuals",
    description:
      "Follow smooth route curves, heading-aware markers, and theme-aware map styling.",
    icon: Waves,
  },
];

const trustSignals = [
  "Fast API-backed lookups",
  "Built-in response caching",
  "Dark and light mode support",
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-18rem] -z-10 mx-auto h-[32rem] max-w-[72rem] rounded-full bg-primary/20 blur-3xl"
      />

      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-12 lg:pt-24">
        <div className="space-y-7">
          <Badge className="bg-primary/15 text-primary">Modern flight intelligence</Badge>
          <div className="space-y-4">
            <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Track active flights with a clean, real-time operations view.
            </h1>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              A focused SaaS-style cockpit for monitoring a single flight or exploring all
              active routes for an airline in seconds.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link href="/tracker" className={cn(buttonVariants({ size: "lg" }))}>
              Start Tracking
            </Link>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="size-4" />
              Refreshes live positions every minute
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {trustSignals.map((signal) => (
              <Badge key={signal} variant="outline" className="rounded-full px-3 py-1">
                {signal}
              </Badge>
            ))}
          </div>
        </div>

        <Card className="border border-border/70 bg-card/80 shadow-sm backdrop-blur">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              <Sparkles className="size-3.5" />
              Why teams use it
            </Badge>
            <CardTitle className="text-xl">Designed for clarity under time pressure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <Icon className="size-4 text-primary" />
                    {item.title}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-border/70 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Real-Time Flights</p>
        <div className="flex items-center gap-3">
          <p>Built for modern operations workflows</p>
          <ThemeToggle />
        </div>
      </footer>
    </main>
  );
}
