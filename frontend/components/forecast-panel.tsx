"use client"

import { ShieldCheck, PackagePlus, CalendarClock, ArrowRight } from "lucide-react"
import { formatNumber, type EnrichedItem } from "@/lib/inventory"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"

export function ForecastPanel({
  items,
  onForecast,
}: {
  items: EnrichedItem[]
  onForecast: (item: EnrichedItem) => void
}) {
  // Surface the items that most need attention first.
  const ordered = [...items].sort((a, b) => a.reorderInDays - b.reorderInDays)

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {ordered.map((item) => {
        const gap = item.suggestedReorderPoint - item.reorderPoint
        return (
          <button
            key={item.sku}
            type="button"
            onClick={() => onForecast(item)}
            className="group flex flex-col rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                <p className="mt-0.5 font-medium text-card-foreground text-pretty">{item.name}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Stat icon={ShieldCheck} label="Safety" value={formatNumber(item.safetyStock)} />
              <Stat icon={PackagePlus} label="EOQ" value={formatNumber(item.eoq)} />
              <Stat icon={CalendarClock} label="ROP" value={formatNumber(item.suggestedReorderPoint)} />
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span
                className={cn(
                  "text-xs",
                  gap > 0 ? "text-warn-foreground" : "text-muted-foreground",
                )}
              >
                {gap > 0
                  ? `Raise ROP by ${formatNumber(gap)}`
                  : "ROP well calibrated"}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Forecast
                <ArrowRight className="size-3" aria-hidden="true" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-secondary/50 p-2">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3 text-primary" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-card-foreground">
        {value}
      </p>
    </div>
  )
}
