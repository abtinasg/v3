import { useMemo } from "react"
import { ShieldQuestion } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { RiskMetrics, RiskLevel } from "@/types"

interface RiskPanelProps {
  riskMetrics: RiskMetrics
  onExplain: (metricId: string) => void
  tier: "free" | "pro"
}

const riskLevelConfig: Record<
  RiskLevel,
  {
    label: string
    color: string
    bg: string
    dot: string
  }
> = {
  low: {
    label: "Low",
    color: "text-emerald-400",
    bg: "border-emerald-500/30 bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "border-amber-500/30 bg-amber-500/10",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    color: "text-red-400",
    bg: "border-red-500/30 bg-red-500/10",
    dot: "bg-red-400",
  },
}

function clampScore(score: number) {
  if (!Number.isFinite(score)) return 0
  return Math.min(100, Math.max(0, score))
}

function getLevelByScore(score: number): RiskLevel {
  if (score < 35) return "low"
  if (score < 70) return "medium"
  return "high"
}

function getMarketRiskLevel(marketRisk: RiskMetrics["marketRisk"]): RiskLevel {
  const volatility = marketRisk.volatility90D ?? marketRisk.volatility30D
  if (volatility !== null && volatility !== undefined) {
    if (volatility >= 55) return "high"
    if (volatility >= 30) return "medium"
    return "low"
  }

  const beta = marketRisk.beta ?? 1
  if (beta >= 1.3) return "high"
  if (beta >= 0.95) return "medium"
  return "low"
}

function getFundamentalRiskLevel(fundamentalRisk: RiskMetrics["fundamentalRisk"]): RiskLevel {
  const levels: RiskLevel[] = [fundamentalRisk.debtRisk, fundamentalRisk.interestCoverageRisk]
  if (levels.includes("high")) return "high"
  if (levels.includes("medium")) return "medium"
  return "low"
}

function RiskGauge({ score, riskLevel, gradientId }: { score: number; riskLevel: RiskLevel; gradientId: string }) {
  const normalizedScore = clampScore(score)
  const progress = normalizedScore / 100
  const arcPath = "M 20 100 A 60 60 0 0 1 140 100"
  const strokeDasharray = 100
  const strokeDashoffset = strokeDasharray * (1 - progress)

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4">
      <svg viewBox="0 0 160 110" className="h-40 w-40 drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
        <defs>
          <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
        <path
          d={arcPath}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          pathLength={strokeDasharray}
        />
        <path
          d={arcPath}
          stroke={`url(#${gradientId})`}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          pathLength={strokeDasharray}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <circle cx="80" cy="100" r="4" fill="currentColor" className={riskLevelConfig[riskLevel].dot} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{normalizedScore.toFixed(0)}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk Score</span>
      </div>
    </div>
  )
}

function RiskCategoryItem({
  id,
  label,
  level,
  onExplain,
}: {
  id: string
  label: string
  level: RiskLevel
  onExplain: (metricId: string) => void
}) {
  const config = riskLevelConfig[level]
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 p-3">
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 rounded-full", config.dot)} aria-hidden />
        <span className="text-sm text-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className={cn("text-xs font-medium", config.bg, config.color)}>
          {config.label}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onExplain(id)}
          aria-label={`Explain ${label}`}
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <ShieldQuestion className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  )
}

export function RiskPanel({ riskMetrics, onExplain, tier }: RiskPanelProps) {
  const gradientId = useMemo(() => `risk-gauge-${riskMetrics.symbol}`.toLowerCase(), [riskMetrics.symbol])
  const effectiveLevel = riskMetrics.riskLevel ?? getLevelByScore(riskMetrics.overallRiskScore)
  const levelConfig = riskLevelConfig[effectiveLevel]
  const isFreeTier = tier === "free"

  return (
    <Card className="h-full border-border/60 bg-card/50 shadow-lg">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-sm font-semibold tracking-[0.25em] text-muted-foreground">RISK PROFILE</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
          <div className="md:col-span-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-foreground">Overall Risk</h3>
                <Badge
                  variant="outline"
                  className={cn("rounded-full border px-3 py-1 text-xs", levelConfig.bg, levelConfig.color)}
                >
                  {levelConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Comprehensive risk assessment combining market volatility, fundamentals, and liquidity signals.
              </p>
            </div>
          </div>
          <RiskGauge score={riskMetrics.overallRiskScore} riskLevel={effectiveLevel} gradientId={gradientId} />
        </div>

        {isFreeTier ? (
          <div className="mt-8 rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-center text-sm text-muted-foreground">
            Upgrade to Pro for detailed risk breakdown and category explanations.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Risk Breakdown</h4>
              <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Pro Exclusive
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <RiskCategoryItem
                id="marketRisk"
                label="Market Risk"
                level={getMarketRiskLevel(riskMetrics.marketRisk)}
                onExplain={onExplain}
              />
              <RiskCategoryItem
                id="fundamentalRisk"
                label="Fundamental Risk"
                level={getFundamentalRiskLevel(riskMetrics.fundamentalRisk)}
                onExplain={onExplain}
              />
              <RiskCategoryItem
                id="liquidityRisk"
                label="Liquidity Risk"
                level={riskMetrics.liquidityRisk.volumeRisk}
                onExplain={onExplain}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
