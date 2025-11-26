import { useMemo } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { OHLCV } from "@/types"

export interface StockChartProps {
  symbol: string
  data: OHLCV[]
  chartType: "line" | "candlestick"
  timeRange: string
  onTimeRangeChange: (range: string) => void
  isLoading?: boolean
}

const TIME_RANGES = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const volumeFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

type ChartPoint = OHLCV & { timestampMs: number }

function formatDateLabel(timestamp: number, range: string) {
  const date = new Date(timestamp)

  if (range === "1D") {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date)
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)
}

function ChartTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload as ChartPoint | undefined

  if (!point) return null

  return (
    <div className="rounded-lg border border-[#1f2937] bg-[#0b1220]/90 p-3 shadow-lg backdrop-blur">
      <p className="text-xs text-[#9ca3af]">
        {new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }).format(point.timestampMs)}
      </p>
      <div className="mt-2 space-y-1 text-sm text-white">
        <p>
          <span className="text-[#9ca3af]">Open:</span> {priceFormatter.format(point.open)}
        </p>
        <p>
          <span className="text-[#9ca3af]">High:</span> {priceFormatter.format(point.high)}
        </p>
        <p>
          <span className="text-[#9ca3af]">Low:</span> {priceFormatter.format(point.low)}
        </p>
        <p>
          <span className="text-[#9ca3af]">Close:</span> {priceFormatter.format(point.close)}
        </p>
        <p>
          <span className="text-[#9ca3af]">Volume:</span> {volumeFormatter.format(point.volume)}
        </p>
      </div>
    </div>
  )
}

function StockChartSkeleton({ symbol, timeRange, onTimeRangeChange }: Pick<StockChartProps, "symbol" | "timeRange" | "onTimeRangeChange">) {
  return (
    <section className="rounded-2xl border bg-card/40 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{symbol}</p>
          <h2 className="text-xl font-semibold text-foreground">Price Chart</h2>
        </div>
        <Tabs value={timeRange} onValueChange={onTimeRangeChange} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:auto-cols-fr sm:grid-cols-6">
            {TIME_RANGES.map((range) => (
              <TabsTrigger key={range} value={range}>
                {range}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-xl bg-muted/40" />
    </section>
  )
}

export function StockChart({
  symbol,
  data,
  chartType,
  timeRange,
  onTimeRangeChange,
  isLoading,
}: StockChartProps) {
  const chartData = useMemo(
    () =>
      data.map((point) => {
        const date = point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp)

        return {
          ...point,
          timestampMs: date.getTime(),
        }
      }),
    [data]
  )

  if (isLoading) {
    return <StockChartSkeleton symbol={symbol} timeRange={timeRange} onTimeRangeChange={onTimeRangeChange} />
  }

  if (!chartData.length) {
    return (
      <section className="rounded-2xl border bg-card/40 p-6 text-center text-muted-foreground backdrop-blur">
        <p>No chart data available for {symbol}.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border bg-card/40 p-6 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{symbol}</p>
          <h2 className="text-xl font-semibold text-foreground">
            {chartType === "candlestick" ? "Price Overview" : "Price Chart"}
          </h2>
        </div>
        <Tabs value={timeRange} onValueChange={onTimeRangeChange} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:auto-cols-fr sm:grid-cols-6">
            {TIME_RANGES.map((range) => (
              <TabsTrigger key={range} value={range}>
                {range}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="mt-6 h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            style={{ backgroundColor: "transparent" }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestampMs"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => formatDateLabel(value as number, timeRange)}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#1f2937" }}
              tickLine={{ stroke: "#1f2937" }}
            />
            <YAxis
              yAxisId="price"
              tickFormatter={(value) => priceFormatter.format(Number(value))}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#1f2937" }}
              tickLine={{ stroke: "#1f2937" }}
              domain={["dataMin", "dataMax"]}
            />
            <YAxis yAxisId="volume" hide domain={[0, "dataMax"]} />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "#374151", strokeWidth: 1 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              barSize={12}
              radius={[4, 4, 0, 0]}
              fill="rgba(59, 130, 246, 0.25)"
              className="[&>path]:stroke-none"
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

export default StockChart
