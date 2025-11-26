import { ArrowDownRight, ArrowUpRight, Minus, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface StockHeaderProps {
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  onAddToStudyList: () => void
  isInStudyList: boolean
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

function formatMarketCap(value: number) {
  if (!Number.isFinite(value)) return "—"
  const units = [
    { limit: 1_000_000_000_000, suffix: "T" },
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
    { limit: 1_000, suffix: "K" },
  ]

  for (const unit of units) {
    if (value >= unit.limit) {
      return `$${(value / unit.limit).toFixed(2)}${unit.suffix}`
    }
  }

  return `$${value.toLocaleString()}`
}

export function StockHeader({
  symbol,
  name,
  exchange,
  price,
  change,
  changePercent,
  marketCap,
  onAddToStudyList,
  isInStudyList,
}: StockHeaderProps) {
  const isPositive = change > 0
  const isNegative = change < 0
  const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus

  const changeBadgeClassName = cn(
    "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium",
    isPositive && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    isNegative && "border-red-500/20 bg-red-500/10 text-red-400",
    !isPositive && !isNegative && "border-border text-muted-foreground"
  )

  return (
    <section className="flex flex-col gap-6 rounded-2xl border bg-card/40 p-6 backdrop-blur">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{symbol}</h1>
            <Badge variant="secondary" className="text-xs uppercase tracking-wide text-muted-foreground">
              {exchange}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{name}</p>
        </div>

        <div className="flex flex-col gap-2 text-left lg:text-center">
          <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-end lg:justify-center">
            <span className="text-4xl font-mono font-semibold text-foreground">
              {priceFormatter.format(price)}
            </span>
            <span className={changeBadgeClassName}>
              <ChangeIcon className="size-4" aria-hidden />
              <span>
                {change.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Market Cap: <span className="font-medium text-foreground">{formatMarketCap(marketCap)}</span>
          </p>
        </div>

        <div className="flex items-center justify-start lg:justify-end">
          <Button
            type="button"
            variant={isInStudyList ? "secondary" : "default"}
            onClick={onAddToStudyList}
            disabled={isInStudyList}
            aria-pressed={isInStudyList}
            className={cn(
              "min-w-[180px]",
              isInStudyList && "border border-yellow-400/40 bg-yellow-500/10 text-yellow-400"
            )}
          >
            <Star
              className={cn(
                "size-4",
                isInStudyList ? "fill-yellow-400 text-yellow-400" : "text-primary-foreground"
              )}
              aria-hidden
            />
            {isInStudyList ? "In Study List" : "Add to Study List"}
          </Button>
        </div>
      </div>
    </section>
  )
}
