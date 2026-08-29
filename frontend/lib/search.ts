import type { EnrichedItem } from "./inventory"

export interface SearchResult {
  items: EnrichedItem[]
  interpretation: string
  sortNote?: string
}

/**
 * Lightweight natural-language interpreter for inventory questions.
 * Maps common intents (runout windows, status, value, category, reorder cost)
 * onto structured filters and sorts. No network call required.
 */
export function interpretQuery(raw: string, items: EnrichedItem[]): SearchResult {
  const q = raw.trim().toLowerCase()
  if (!q) return { items, interpretation: "Showing all inventory items." }

  let result = [...items]
  const notes: string[] = []
  let sortNote: string | undefined

  // Time window: "next week", "next N days", "this month"
  const windowMatch = q.match(/next\s+(\d+)\s*day/) || q.match(/in\s+(\d+)\s*day/)
  let horizon: number | null = null
  if (windowMatch) horizon = Number.parseInt(windowMatch[1], 10)
  else if (/next week|this week|a week/.test(q)) horizon = 7
  else if (/next month|this month/.test(q)) horizon = 30
  else if (/tomorrow/.test(q)) horizon = 1

  const runoutIntent = /run\s?out|deplet|stockout|out of stock|running low|reorder|replenish/.test(q)

  if (horizon !== null && runoutIntent) {
    result = result
      .filter((i) => i.reorderInDays <= horizon!)
      .sort((a, b) => a.reorderInDays - b.reorderInDays)
    notes.push(`items projected to hit their reorder point within ${horizon} day${horizon === 1 ? "" : "s"}`)
    sortNote = "Sorted by soonest reorder date"
  } else if (runoutIntent) {
    result = result
      .filter((i) => i.status !== "in_stock")
      .sort((a, b) => a.reorderInDays - b.reorderInDays)
    notes.push("items at or below their reorder point")
    sortNote = "Sorted by soonest reorder date"
  }

  // Status intents
  if (/critical|urgent|emergency/.test(q)) {
    result = result.filter((i) => i.status === "critical")
    notes.push("critical stock")
  } else if (/low stock|low on|almost out/.test(q)) {
    result = result.filter((i) => i.status !== "in_stock")
    notes.push("low or critical stock")
  } else if (/\bin stock|healthy|well stocked/.test(q)) {
    result = result.filter((i) => i.status === "in_stock")
    notes.push("healthy stock")
  }

  // Category intents
  const catWords = ["electronics", "hardware", "safety", "industrial", "consumables"]
  for (const c of catWords) {
    if (q.includes(c)) {
      result = result.filter((i) => i.category.toLowerCase() === c)
      notes.push(`category ${c}`)
    }
  }

  // Value / cost intents
  if (/most valuable|highest value|top value|expensive/.test(q)) {
    result = [...result].sort((a, b) => b.value - a.value)
    sortNote = "Sorted by inventory value (high → low)"
    notes.push("ranked by inventory value")
  } else if (/reorder cost|cost to reorder|replenish cost|order cost/.test(q)) {
    result = [...result].sort((a, b) => b.reorderCost - a.reorderCost)
    sortNote = "Sorted by predicted reorder cost (high → low)"
    notes.push("ranked by predicted reorder cost")
  } else if (/fastest|highest demand|selling fast|moving fast/.test(q)) {
    result = [...result].sort((a, b) => b.dailyDemand - a.dailyDemand)
    sortNote = "Sorted by daily demand (high → low)"
    notes.push("ranked by demand velocity")
  }

  // Free-text fallback across name / sku / category
  if (notes.length === 0) {
    const tokens = q.split(/\s+/).filter((t) => t.length > 1)
    result = result.filter((i) => {
      const hay = `${i.sku} ${i.name} ${i.category}`.toLowerCase()
      return tokens.some((t) => hay.includes(t))
    })
    notes.push(`matches for “${raw.trim()}”`)
  }

  const interpretation =
    result.length === 0
      ? `No items match: ${notes.join(", ")}.`
      : `Showing ${result.length} ${notes.join(", ")}.`

  return { items: result, interpretation, sortNote }
}

export const SAMPLE_QUERIES = [
  "Which items will run out next week?",
  "Show critical electronics",
  "Highest predicted reorder cost",
  "Most valuable inventory",
  "What is low on safety gear?",
]
