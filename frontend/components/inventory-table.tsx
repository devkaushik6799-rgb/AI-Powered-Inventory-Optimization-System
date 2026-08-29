"use client"

import { LineChart, ArrowUpDown, PackageSearch } from "lucide-react"
import { formatNumber, type EnrichedItem } from "@/lib/inventory"
import { StatusBadge } from "./status-badge"
import { cn } from "@/lib/utils"

interface InventoryTableProps {
  items: EnrichedItem[]
  onForecast: (item: EnrichedItem) => void
}

export function InventoryTable({ items, onForecast }: InventoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <PackageSearch className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-sm font-medium text-card-foreground">Inventory Items</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground">
            {items.length}
          </span>
        </div>
        <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
          <ArrowUpDown className="size-3" aria-hidden="true" />
          Click a row for forecast
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2.5 font-medium">SKU ID</th>
              <th className="px-4 py-2.5 font-medium">Product Name</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Stock Level</th>
              <th className="px-4 py-2.5 text-right font-medium">Reorder Point</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Forecast</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No items match your query.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const pct = Math.min(
                  100,
                  Math.round((item.stock / Math.max(item.reorderPoint * 2, 1)) * 100),
                )
                return (
                  <tr
                    key={item.sku}
                    onClick={() => onForecast(item)}
                    className="cursor-pointer border-b border-border/70 last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3 font-medium text-card-foreground">{item.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-mono tabular-nums text-card-foreground">
                          {formatNumber(item.stock)}
                        </span>
                        <span className="h-1 w-20 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                          <span
                            className={cn(
                              "block h-full rounded-full",
                              item.status === "critical"
                                ? "bg-crit"
                                : item.status === "low_stock"
                                  ? "bg-warn"
                                  : "bg-ok",
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                      {formatNumber(item.reorderPoint)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onForecast(item)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
                      >
                        <LineChart className="size-3.5" aria-hidden="true" />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
