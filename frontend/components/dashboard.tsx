"use client"

import { useMemo, useState } from "react"
import { Boxes, Table2, LineChart } from "lucide-react"
import { inventory, type EnrichedItem } from "@/lib/inventory"
import { interpretQuery } from "@/lib/search"
import { MetricsBar } from "./metrics-bar"
import { AiSearch } from "./ai-search"
import { InventoryTable } from "./inventory-table"
import { ForecastPanel } from "./forecast-panel"
import { ForecastModal } from "./forecast-modal"
import { cn } from "@/lib/utils"

type Tab = "inventory" | "forecast"

export function Dashboard() {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<Tab>("inventory")
  const [active, setActive] = useState<EnrichedItem | null>(null)

  const search = useMemo(() => interpretQuery(query, inventory), [query])
  const visible = query ? search.items : inventory

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-sm font-semibold leading-none text-foreground">Stockpilot</h1>
              <p className="mt-1 text-xs text-muted-foreground">AI Inventory Optimization</p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 text-xs font-medium text-ok sm:inline-flex">
            <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
            Live sync
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
        <AiSearch
          value={query}
          active={!!query}
          interpretation={search.interpretation}
          onSubmit={(q) => {
            setQuery(q)
            setTab("inventory")
          }}
          onClear={() => setQuery("")}
        />

        <MetricsBar items={inventory} />

        <div className="mt-1 flex items-center gap-1 rounded-lg border border-border bg-card p-1 shadow-sm sm:w-fit">
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")} icon={Table2}>
            Inventory Items
          </TabButton>
          <TabButton active={tab === "forecast"} onClick={() => setTab("forecast")} icon={LineChart}>
            Demand Forecast &amp; EOQ
          </TabButton>
        </div>

        {tab === "inventory" ? (
          <>
            {query && search.sortNote && (
              <p className="-mt-1 text-xs text-muted-foreground">{search.sortNote}</p>
            )}
            <InventoryTable items={visible} onForecast={setActive} />
          </>
        ) : (
          <ForecastPanel items={visible} onForecast={setActive} />
        )}
      </main>

      <ForecastModal item={active} onClose={() => setActive(null)} />
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: typeof Table2
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:flex-none",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </button>
  )
}
