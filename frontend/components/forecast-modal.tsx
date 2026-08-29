"use client"

import { useEffect } from "react"
import { X, TrendingUp, ShieldCheck, PackagePlus, CalendarClock } from "lucide-react"
import {
  formatCurrency,
  formatNumber,
  statusMeta,
  type EnrichedItem,
} from "@/lib/inventory"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"

/** Deterministic 8-week demand projection with mild trend + seasonality. */
function buildForecast(item: EnrichedItem) {
  const base = item.dailyDemand * 7
  const seed = item.sku.split("").reduce((s, c) => s + c.charCodeAt(0), 0)
  return Array.from({ length: 8 }, (_, w) => {
    const trend = 1 + w * 0.015
    const wave = 1 + Math.sin((seed + w) * 0.9) * 0.12
    return Math.round(base * trend * wave)
  })
}

function Recommendation({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 text-primary" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1.5 font-mono text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export function ForecastModal({
  item,
  onClose,
}: {
  item: EnrichedItem | null
  onClose: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (item) {
      document.addEventListener("keydown", onKey)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [item, onClose])

  if (!item) return null

  const forecast = buildForecast(item)
  const max = Math.max(...forecast, 1)
  const totalForecast = forecast.reduce((s, v) => s + v, 0)
  const gap = item.suggestedReorderPoint - item.reorderPoint

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Demand forecast and EOQ for ${item.name}`}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
              <StatusBadge status={item.status} />
            </div>
            <h2 className="mt-1 text-lg font-semibold text-card-foreground text-balance">
              {item.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {item.category} · {formatNumber(item.stock)} on hand · {item.daysOfCover} days of cover
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <section>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                <TrendingUp className="size-4 text-primary" aria-hidden="true" />
                8-Week Demand Forecast
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {formatNumber(totalForecast)} units projected
              </span>
            </div>

            <div className="mt-4 flex h-40 items-end gap-2">
              {forecast.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">{v}</span>
                  <div
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${Math.max((v / max) * 120, 6)}px` }}
                    aria-hidden="true"
                  />
                  <span className="text-[10px] text-muted-foreground">W{i + 1}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-medium text-card-foreground">Safety Stock & EOQ Recommendations</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Recommendation
                icon={ShieldCheck}
                label="Safety Stock"
                value={formatNumber(item.safetyStock)}
                hint="~95% service level"
              />
              <Recommendation
                icon={PackagePlus}
                label="EOQ"
                value={formatNumber(item.eoq)}
                hint={`${formatCurrency(item.reorderCost)} per order`}
              />
              <Recommendation
                icon={CalendarClock}
                label="Reorder Point"
                value={formatNumber(item.suggestedReorderPoint)}
                hint={`lead time ${item.leadTimeDays}d`}
              />
              <Recommendation
                icon={TrendingUp}
                label="Daily Demand"
                value={formatNumber(item.dailyDemand)}
                hint={`±${item.demandStdDev} std dev`}
              />
            </div>
          </section>

          <section
            className={cn(
              "mt-5 rounded-lg border p-4 text-sm",
              gap > 0 ? "border-warn/35 bg-warn/10" : "border-ok/25 bg-ok/10",
            )}
          >
            <p className="font-medium text-foreground">AI Recommendation</p>
            <p className="mt-1 text-muted-foreground">
              {gap > 0 ? (
                <>
                  Raise the reorder point from{" "}
                  <span className="font-mono text-foreground">{formatNumber(item.reorderPoint)}</span> to{" "}
                  <span className="font-mono text-foreground">
                    {formatNumber(item.suggestedReorderPoint)}
                  </span>{" "}
                  (+{formatNumber(gap)}) to protect against demand variability over the{" "}
                  {item.leadTimeDays}-day lead time. Order{" "}
                  <span className="font-mono text-foreground">{formatNumber(item.eoq)}</span> units when
                  triggered.
                </>
              ) : (
                <>
                  Current reorder point is well calibrated. Continue ordering in EOQ batches of{" "}
                  <span className="font-mono text-foreground">{formatNumber(item.eoq)}</span> units to
                  minimize combined holding and ordering cost.
                </>
              )}
            </p>
          </section>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {statusMeta[item.status].label} · projected reorder in {item.reorderInDays} days
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}
