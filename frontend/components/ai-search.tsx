"use client"

import { useState } from "react"
import { Sparkles, Search, CornerDownLeft, X } from "lucide-react"
import { SAMPLE_QUERIES } from "@/lib/search"
import { cn } from "@/lib/utils"

interface AiSearchProps {
  value: string
  onSubmit: (q: string) => void
  onClear: () => void
  interpretation?: string
  active: boolean
}

export function AiSearch({ value, onSubmit, onClear, interpretation, active }: AiSearchProps) {
  const [draft, setDraft] = useState(value)

  function submit(q: string) {
    setDraft(q)
    onSubmit(q)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
        <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" />
        </span>
        AI Natural Language Search
      </div>

      <form
        className="mt-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit(draft)
        }}
      >
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.nativeEvent.isComposing || e.keyCode === 229)) e.preventDefault()
            }}
            placeholder="Ask anything — e.g. “Which items will run out next week?”"
            aria-label="Ask a question about your inventory"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          {active && (
            <button
              type="button"
              onClick={() => {
                setDraft("")
                onClear()
              }}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" aria-hidden="true" />
              Clear
            </button>
          )}
          <button
            type="submit"
            className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Ask
            <CornerDownLeft className="size-3" aria-hidden="true" />
          </button>
        </div>
      </form>

      {active && interpretation ? (
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-foreground">
          <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" aria-hidden="true" />
          <span>{interpretation}</span>
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className={cn(
                "rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground",
                "hover:border-primary/40 hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
