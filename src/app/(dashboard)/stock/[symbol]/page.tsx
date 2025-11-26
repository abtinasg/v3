"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { MetricsGrid, RiskPanel, StockChart, StockHeader } from "@/components/stock"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useAddToStudyList,
  useChart,
  useFundamentals,
  useProfile,
  useQuote,
  useRisk,
  useStudyList,
} from "@/hooks"

type StockPageProps = {
  params: { symbol: string }
}

function HeaderSkeleton() {
  return (
    <Card className="border-border/60 bg-card/50 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-2 text-left lg:text-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-10 w-44" />
      </div>
    </Card>
  )
}

function SectionSkeleton() {
  return (
    <Card className="border-border/60 bg-card/50">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function StockPage({ params }: StockPageProps) {
  const symbol = useMemo(() => params.symbol?.toUpperCase() ?? "", [params.symbol])
  const [chartRange, setChartRange] = useState("1M")
  const [chartType] = useState<"line" | "candlestick">("candlestick")

  const { data: profile } = useProfile()
  const tier = profile?.subscription ?? "free"

  const { data: quote, isLoading: quoteLoading, error: quoteError } = useQuote(symbol)
  const { data: fundamentals, isLoading: fundamentalsLoading } = useFundamentals(symbol)
  const { data: risk, isLoading: riskLoading } = useRisk(symbol)
  const { data: chart, isLoading: chartLoading } = useChart(symbol, chartRange)

  const { data: studyList } = useStudyList()
  const addToStudyList = useAddToStudyList()

  const isInStudyList = useMemo(
    () => Boolean(studyList?.items?.some((item) => item.symbol === symbol)),
    [studyList?.items, symbol]
  )

  const handleAddToStudyList = () => {
    if (quote?.symbol) {
      addToStudyList.mutate(quote.symbol)
    }
  }

  const handleExplain = (metricId: string) => {
    console.info(`Explain metric: ${metricId}`)
  }

  const symbolNotFound =
    (quoteError && quoteError.message?.toLowerCase().includes("not found")) ||
    (!quote && !quoteLoading)

  if (symbolNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e17] px-6 text-white">
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
          <AlertTriangle className="size-5" aria-hidden />
          <div>
            <p className="text-lg font-semibold">Symbol not found</p>
            <p className="text-sm text-red-100/80">{symbol ? `${symbol} could not be located.` : "Please provide a symbol."}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        {quoteLoading && !quote ? (
          <HeaderSkeleton />
        ) : quote ? (
          <StockHeader
            symbol={quote.symbol}
            name={quote.name}
            exchange={quote.exchange}
            price={quote.price}
            change={quote.change}
            changePercent={quote.changePercent}
            marketCap={quote.marketCap}
            onAddToStudyList={handleAddToStudyList}
            isInStudyList={isInStudyList || addToStudyList.isPending}
          />
        ) : null}

        <StockChart
          symbol={symbol}
          data={chart ?? []}
          chartType={chartType}
          timeRange={chartRange}
          onTimeRangeChange={setChartRange}
          isLoading={chartLoading && !(chart?.length)}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {fundamentalsLoading && !fundamentals ? (
              <SectionSkeleton />
            ) : fundamentals ? (
              <MetricsGrid metrics={fundamentals} onExplain={handleExplain} tier={tier} />
            ) : (
              <Card className="border-border/60 bg-card/40">
                <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  <span>Loading fundamentals...</span>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="lg:col-span-4">
            {riskLoading && !risk ? (
              <SectionSkeleton />
            ) : risk ? (
              <RiskPanel riskMetrics={risk} onExplain={handleExplain} tier={tier} />
            ) : (
              <Card className="border-border/60 bg-card/40">
                <CardContent className="flex items-center gap-3 p-6 text-muted-foreground">
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  <span>Loading risk metrics...</span>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
