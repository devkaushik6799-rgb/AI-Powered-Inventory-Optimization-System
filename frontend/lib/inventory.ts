export type Status = "in_stock" | "low_stock" | "critical"

export interface InventoryItem {
  sku: string
  name: string
  category: string
  stock: number
  reorderPoint: number
  unitCost: number
  /** average units sold per day (demand) */
  dailyDemand: number
  /** supplier lead time in days */
  leadTimeDays: number
  /** std deviation of daily demand, drives safety stock */
  demandStdDev: number
  /** fixed cost to place one order */
  orderCost: number
  /** annual holding cost as a fraction of unit cost */
  holdingRate: number
}

export interface EnrichedItem extends InventoryItem {
  status: Status
  /** days of cover left at current demand */
  daysOfCover: number
  /** projected date the item hits its reorder point */
  reorderInDays: number
  value: number
  /** Economic Order Quantity */
  eoq: number
  /** Safety stock (units) for ~95% service level */
  safetyStock: number
  /** Reorder point suggested by the model */
  suggestedReorderPoint: number
  /** cost of the next recommended reorder */
  reorderCost: number
}

const Z_95 = 1.65 // service level factor ~95%

export function enrich(item: InventoryItem): EnrichedItem {
  const annualDemand = item.dailyDemand * 365
  const eoq = Math.round(
    Math.sqrt((2 * annualDemand * item.orderCost) / (item.unitCost * item.holdingRate)),
  )
  const safetyStock = Math.round(Z_95 * item.demandStdDev * Math.sqrt(item.leadTimeDays))
  const suggestedReorderPoint = Math.round(item.dailyDemand * item.leadTimeDays + safetyStock)
  const daysOfCover = item.dailyDemand > 0 ? Math.round(item.stock / item.dailyDemand) : 999
  const reorderInDays = Math.max(
    0,
    Math.round((item.stock - item.reorderPoint) / Math.max(item.dailyDemand, 0.01)),
  )

  let status: Status = "in_stock"
  if (item.stock <= item.reorderPoint * 0.5) status = "critical"
  else if (item.stock <= item.reorderPoint) status = "low_stock"

  return {
    ...item,
    status,
    daysOfCover,
    reorderInDays,
    value: Math.round(item.stock * item.unitCost),
    eoq,
    safetyStock,
    suggestedReorderPoint,
    reorderCost: Math.round(eoq * item.unitCost),
  }
}

const RAW: InventoryItem[] = [
  { sku: "SKU-1001", name: "Aluminum Bracket 40mm", category: "Hardware", stock: 1240, reorderPoint: 400, unitCost: 2.4, dailyDemand: 38, leadTimeDays: 7, demandStdDev: 9, orderCost: 60, holdingRate: 0.22 },
  { sku: "SKU-1002", name: "Lithium Cell 18650", category: "Electronics", stock: 210, reorderPoint: 500, unitCost: 3.1, dailyDemand: 74, leadTimeDays: 14, demandStdDev: 22, orderCost: 90, holdingRate: 0.25 },
  { sku: "SKU-1003", name: "Nitrile Gloves (M)", category: "Safety", stock: 60, reorderPoint: 300, unitCost: 0.12, dailyDemand: 110, leadTimeDays: 5, demandStdDev: 34, orderCost: 40, holdingRate: 0.18 },
  { sku: "SKU-1004", name: "Thermal Paste 4g", category: "Electronics", stock: 880, reorderPoint: 250, unitCost: 1.8, dailyDemand: 21, leadTimeDays: 9, demandStdDev: 6, orderCost: 55, holdingRate: 0.2 },
  { sku: "SKU-1005", name: "Steel Fastener M6", category: "Hardware", stock: 320, reorderPoint: 350, unitCost: 0.09, dailyDemand: 64, leadTimeDays: 6, demandStdDev: 18, orderCost: 45, holdingRate: 0.15 },
  { sku: "SKU-1006", name: "USB-C Cable 1m", category: "Electronics", stock: 1560, reorderPoint: 500, unitCost: 1.2, dailyDemand: 47, leadTimeDays: 12, demandStdDev: 14, orderCost: 70, holdingRate: 0.22 },
  { sku: "SKU-1007", name: "Hydraulic Seal Kit", category: "Industrial", stock: 45, reorderPoint: 120, unitCost: 14.5, dailyDemand: 9, leadTimeDays: 21, demandStdDev: 4, orderCost: 120, holdingRate: 0.28 },
  { sku: "SKU-1008", name: "PLA Filament 1kg", category: "Consumables", stock: 640, reorderPoint: 200, unitCost: 12.0, dailyDemand: 16, leadTimeDays: 8, demandStdDev: 5, orderCost: 65, holdingRate: 0.2 },
  { sku: "SKU-1009", name: "Safety Goggles", category: "Safety", stock: 95, reorderPoint: 150, unitCost: 3.4, dailyDemand: 12, leadTimeDays: 10, demandStdDev: 4, orderCost: 50, holdingRate: 0.18 },
  { sku: "SKU-1010", name: "Circuit Breaker 16A", category: "Electronics", stock: 410, reorderPoint: 180, unitCost: 8.9, dailyDemand: 14, leadTimeDays: 15, demandStdDev: 5, orderCost: 95, holdingRate: 0.24 },
  { sku: "SKU-1011", name: "Rubber O-Ring 20mm", category: "Industrial", stock: 30, reorderPoint: 200, unitCost: 0.22, dailyDemand: 58, leadTimeDays: 11, demandStdDev: 20, orderCost: 40, holdingRate: 0.16 },
  { sku: "SKU-1012", name: "Ceramic Capacitor Pack", category: "Electronics", stock: 2200, reorderPoint: 600, unitCost: 0.5, dailyDemand: 39, leadTimeDays: 13, demandStdDev: 11, orderCost: 60, holdingRate: 0.22 },
  { sku: "SKU-1013", name: "Cutting Fluid 5L", category: "Consumables", stock: 78, reorderPoint: 90, unitCost: 22.0, dailyDemand: 6, leadTimeDays: 18, demandStdDev: 3, orderCost: 110, holdingRate: 0.26 },
  { sku: "SKU-1014", name: "Wire Terminal Crimp", category: "Hardware", stock: 5400, reorderPoint: 1500, unitCost: 0.03, dailyDemand: 210, leadTimeDays: 9, demandStdDev: 60, orderCost: 50, holdingRate: 0.15 },
  { sku: "SKU-1015", name: "Cooling Fan 120mm", category: "Electronics", stock: 130, reorderPoint: 160, unitCost: 6.5, dailyDemand: 19, leadTimeDays: 16, demandStdDev: 7, orderCost: 85, holdingRate: 0.24 },
]

export const inventory: EnrichedItem[] = RAW.map(enrich)

export const categories = Array.from(new Set(inventory.map((i) => i.category))).sort()

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n)
}

export const statusMeta: Record<Status, { label: string; className: string; dot: string }> = {
  in_stock: {
    label: "In Stock",
    className: "bg-ok/12 text-ok border-ok/25",
    dot: "bg-ok",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-warn/15 text-warn-foreground border-warn/35",
    dot: "bg-warn",
  },
  critical: {
    label: "Critical",
    className: "bg-crit/12 text-crit border-crit/25",
    dot: "bg-crit",
  },
}
