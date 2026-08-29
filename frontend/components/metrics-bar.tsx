import { Boxes, TriangleAlert, Wallet, RefreshCw } from "lucide-react"
import { formatCurrency, formatNumber, type EnrichedItem } from "@/lib/inventory"
import { cn } from "@/lib/utils"

interface Metric {
  label: string
  value: string
  sub: string
  icon: typeof Boxes
  accent: string
}

export function MetricsBar({ items }: { items: EnrichedItem[] }) {
  const totalSkus = items.length
  const lowStock = items.filter((i) => i.status !== "in_stock").length
  const critical = items.filter((i) => i.status === "critical").length
  const totalValue = items.reduce((s, i) => s + i.value, 0)
  // Predicted reorder cost = cost of EOQ replenishment for everything at/under reorder point
  const reorderCost = items
    .filter((i) => i.status !== "in_stock")
    .reduce((s, i) => s + i.reorderCost, 0)

  const metrics: Metric[] = [
    {
      label: "Total SKUs",
      value: formatNumber(totalSkus),
      sub: `${formatNumber(items.reduce((s, i) => s + i.stock, 0))} units on hand`,
      icon: Boxes,
      accent: "text-primary",
    },
    {
      label: "Low Stock Alerts",
      value: formatNumber(lowStock),
      sub: `${critical} critical · needs action`,
      icon: TriangleAlert,
      accent: "text-warn-foreground",
    },
    {
      label: "Total Inventory Value",
      value: formatCurrency(totalValue),
      sub: "at current unit cost",
      icon: Wallet,
      accent: "text-primary",
    },
    {
      label: "Predicted Reorder Cost",
      value: formatCurrency(reorderCost),
      sub: "EOQ across flagged items",
      icon: RefreshCw,
      accent: "text-crit",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m) => {
        const Icon = m.icon
        return (
          <div
            key={m.label}
            className="rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {m.label}
              </span>
              <Icon className={cn("size-4", m.accent)} aria-hidden="true" />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-card-foreground">
              {m.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{m.sub}</p>
          </div>
        )
      })}
    </div>
  )
}
