import { useMemo, useState } from "react"
import { ChevronDown, Lock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { FundamentalMetrics } from "@/types"

interface MetricsGridProps {
  metrics: FundamentalMetrics
  onExplain: (metricId: string) => void
  tier: "free" | "pro"
}

interface MetricConfig {
  id: string
  label: string
  value: number | null
  formatter?: (value: number | null) => string
  proOnly?: boolean
}

interface MetricRowProps extends MetricConfig {
  onExplain: (metricId: string) => void
  locked: boolean
}

function formatPercent(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  return `${value.toFixed(1)}%`
}

function formatCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  const absValue = Math.abs(value)
  const units = [
    { limit: 1_000_000_000_000, suffix: "T" },
    { limit: 1_000_000_000, suffix: "B" },
    { limit: 1_000_000, suffix: "M" },
  ]

  for (const unit of units) {
    if (absValue >= unit.limit) {
      return `${value < 0 ? "-" : ""}$${(absValue / unit.limit).toFixed(2)}${unit.suffix}`
    }
  }

  return `$${value.toLocaleString()}`
}

function formatRatio(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  return `${value.toFixed(1)}x`
}

function formatNumber(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  return value.toLocaleString()
}

function MetricRow({ id, label, value, formatter, onExplain, locked }: MetricRowProps) {
  const formattedValue = locked ? "—" : formatter ? formatter(value) : formatNumber(value)

  return (
    <div className="flex items-center justify-between border-b border-[#1f2937] py-2 last:border-b-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">{label}</span>
        <button
          type="button"
          onClick={() => onExplain(id)}
          disabled={locked}
          aria-label={`Explain ${label}`}
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full border border-gray-700 text-xs font-semibold text-gray-400 transition",
            "hover:bg-gray-800 hover:text-white",
            locked && "cursor-not-allowed opacity-50"
          )}
        >
          ?
        </button>
        {locked && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-gray-500">
                <Lock className="size-4" aria-hidden />
              </div>
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>Upgrade to Pro</TooltipContent>
          </Tooltip>
        )}
      </div>
      <span className={cn("text-sm font-mono", locked && "text-gray-500")}>{formattedValue}</span>
    </div>
  )}

export function MetricsGrid({ metrics, onExplain, tier }: MetricsGridProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const isFreeTier = tier === "free"

  const sections = useMemo(
    () => [
      {
        key: "valuation",
        title: "Valuation",
        metrics: [
          { id: "peRatio", label: "P/E Ratio", value: metrics.valuation.peRatio, formatter: formatRatio },
          { id: "forwardPE", label: "Forward P/E", value: metrics.valuation.forwardPE, formatter: formatRatio },
          { id: "pegRatio", label: "PEG Ratio", value: metrics.valuation.pegRatio, formatter: formatRatio, proOnly: true },
          { id: "pbRatio", label: "P/B Ratio", value: metrics.valuation.pbRatio, formatter: formatRatio },
          { id: "psRatio", label: "P/S Ratio", value: metrics.valuation.psRatio, formatter: formatRatio },
          { id: "evToEbitda", label: "EV/EBITDA", value: metrics.valuation.evToEbitda, formatter: formatRatio, proOnly: true },
          { id: "evToRevenue", label: "EV/Revenue", value: metrics.valuation.evToRevenue, formatter: formatRatio, proOnly: true },
          { id: "evToFcf", label: "EV/FCF", value: metrics.valuation.evToFcf, formatter: formatRatio, proOnly: true },
          { id: "priceToFcf", label: "Price/FCF", value: metrics.valuation.priceToFcf, formatter: formatRatio },
          {
            id: "enterpriseValue",
            label: "Enterprise Value",
            value: metrics.valuation.enterpriseValue,
            formatter: formatCurrency,
            proOnly: true,
          },
        ],
      },
      {
        key: "profitability",
        title: "Profitability",
        metrics: [
          { id: "grossMargin", label: "Gross Margin", value: metrics.profitability.grossMargin, formatter: formatPercent },
          {
            id: "operatingMargin",
            label: "Operating Margin",
            value: metrics.profitability.operatingMargin,
            formatter: formatPercent,
          },
          { id: "ebitdaMargin", label: "EBITDA Margin", value: metrics.profitability.ebitdaMargin, formatter: formatPercent },
          { id: "netMargin", label: "Net Margin", value: metrics.profitability.netMargin, formatter: formatPercent },
          { id: "roe", label: "Return on Equity", value: metrics.profitability.roe, formatter: formatPercent, proOnly: true },
          { id: "roa", label: "Return on Assets", value: metrics.profitability.roa, formatter: formatPercent, proOnly: true },
          { id: "roic", label: "ROIC", value: metrics.profitability.roic, formatter: formatPercent },
          { id: "roce", label: "ROCE", value: metrics.profitability.roce, formatter: formatPercent, proOnly: true },
        ],
      },
      {
        key: "growth",
        title: "Growth",
        metrics: [
          {
            id: "revenueGrowthYoy",
            label: "Revenue Growth YoY",
            value: metrics.growth.revenueGrowthYoy,
            formatter: formatPercent,
          },
          { id: "revenueGrowth3Y", label: "Revenue CAGR (3Y)", value: metrics.growth.revenueGrowth3Y, formatter: formatPercent },
          { id: "revenueGrowth5Y", label: "Revenue CAGR (5Y)", value: metrics.growth.revenueGrowth5Y, formatter: formatPercent, proOnly: true },
          { id: "revenueGrowthQoQ", label: "Revenue Growth QoQ", value: metrics.growth.revenueGrowthQoQ, formatter: formatPercent },
          { id: "epsGrowthYoy", label: "EPS Growth YoY", value: metrics.growth.epsGrowthYoy, formatter: formatPercent },
          { id: "epsGrowth3Y", label: "EPS CAGR (3Y)", value: metrics.growth.epsGrowth3Y, formatter: formatPercent },
          { id: "epsGrowth5Y", label: "EPS CAGR (5Y)", value: metrics.growth.epsGrowth5Y, formatter: formatPercent, proOnly: true },
          { id: "epsGrowthQoQ", label: "EPS Growth QoQ", value: metrics.growth.epsGrowthQoQ, formatter: formatPercent },
          { id: "fcfGrowthYoy", label: "FCF Growth YoY", value: metrics.growth.fcfGrowthYoy, formatter: formatPercent },
          { id: "fcfGrowth3Y", label: "FCF CAGR (3Y)", value: metrics.growth.fcfGrowth3Y, formatter: formatPercent, proOnly: true },
        ],
      },
      {
        key: "income",
        title: "Income",
        metrics: [
          { id: "revenue", label: "Revenue", value: metrics.incomeStatement.revenue, formatter: formatCurrency },
          { id: "grossProfit", label: "Gross Profit", value: metrics.incomeStatement.grossProfit, formatter: formatCurrency },
          {
            id: "operatingIncome",
            label: "Operating Income",
            value: metrics.incomeStatement.operatingIncome,
            formatter: formatCurrency,
          },
          { id: "ebitda", label: "EBITDA", value: metrics.incomeStatement.ebitda, formatter: formatCurrency },
          { id: "netIncome", label: "Net Income", value: metrics.incomeStatement.netIncome, formatter: formatCurrency },
          { id: "eps", label: "EPS", value: metrics.incomeStatement.eps, formatter: formatCurrency },
          { id: "epsDiluted", label: "EPS (Diluted)", value: metrics.incomeStatement.epsDiluted, formatter: formatCurrency, proOnly: true },
        ],
      },
      {
        key: "balance",
        title: "Balance Sheet",
        metrics: [
          { id: "totalAssets", label: "Total Assets", value: metrics.balanceSheet.totalAssets, formatter: formatCurrency },
          {
            id: "totalLiabilities",
            label: "Total Liabilities",
            value: metrics.balanceSheet.totalLiabilities,
            formatter: formatCurrency,
          },
          { id: "totalEquity", label: "Total Equity", value: metrics.balanceSheet.totalEquity, formatter: formatCurrency },
          { id: "cashAndEquivalents", label: "Cash & Equivalents", value: metrics.balanceSheet.cashAndEquivalents, formatter: formatCurrency },
          { id: "currentAssets", label: "Current Assets", value: metrics.balanceSheet.currentAssets, formatter: formatCurrency, proOnly: true },
          { id: "currentLiabilities", label: "Current Liabilities", value: metrics.balanceSheet.currentLiabilities, formatter: formatCurrency, proOnly: true },
          { id: "longTermDebt", label: "Long-Term Debt", value: metrics.balanceSheet.longTermDebt, formatter: formatCurrency },
          { id: "totalDebt", label: "Total Debt", value: metrics.balanceSheet.totalDebt, formatter: formatCurrency },
          { id: "netDebt", label: "Net Debt", value: metrics.balanceSheet.netDebt, formatter: formatCurrency, proOnly: true },
        ],
      },
      {
        key: "cashFlow",
        title: "Cash Flow",
        metrics: [
          {
            id: "operatingCashFlow",
            label: "Operating Cash Flow",
            value: metrics.cashFlow.operatingCashFlow,
            formatter: formatCurrency,
          },
          {
            id: "capitalExpenditures",
            label: "Capital Expenditures",
            value: metrics.cashFlow.capitalExpenditures,
            formatter: formatCurrency,
          },
          { id: "freeCashFlow", label: "Free Cash Flow", value: metrics.cashFlow.freeCashFlow, formatter: formatCurrency },
          { id: "dividendsPaid", label: "Dividends Paid", value: metrics.cashFlow.dividendsPaid, formatter: formatCurrency },
          { id: "shareRepurchases", label: "Share Repurchases", value: metrics.cashFlow.shareRepurchases, formatter: formatCurrency },
          { id: "investingCashFlow", label: "Investing Cash Flow", value: metrics.cashFlow.investingCashFlow, formatter: formatCurrency, proOnly: true },
          { id: "financingCashFlow", label: "Financing Cash Flow", value: metrics.cashFlow.financingCashFlow, formatter: formatCurrency, proOnly: true },
          { id: "netChangeInCash", label: "Net Change in Cash", value: metrics.cashFlow.netChangeInCash, formatter: formatCurrency },
        ],
      },
    ],
    [metrics]
  )

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {sections.map((section) => {
        const isExpanded = expandedSections[section.key] ?? true

        return (
          <Card key={section.key}>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-lg font-semibold text-foreground">{section.title}</CardTitle>
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                aria-expanded={isExpanded}
                aria-controls={`${section.key}-content`}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1 text-sm text-muted-foreground hover:bg-muted"
              >
                <span>{isExpanded ? "Hide" : "Show"}</span>
                <ChevronDown className={cn("size-4 transition", isExpanded ? "rotate-180" : "rotate-0")} aria-hidden />
              </button>
            </CardHeader>
            {isExpanded && (
              <CardContent id={`${section.key}-content`} className="px-6">
                {section.metrics.map((metric) => (
                  <MetricRow
                    key={metric.id}
                    {...metric}
                    locked={isFreeTier && Boolean(metric.proOnly)}
                    onExplain={onExplain}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </section>
  )
}
