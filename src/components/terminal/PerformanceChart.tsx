"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { TooltipProps } from "recharts";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useTerminalStore } from "@/stores";
import type { OHLCV } from "@/types";

const LINE_COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f472b6",
  "#a78bfa",
  "#f87171",
  "#22d3ee",
];

export interface ChartDataPoint {
  date: string;
  [symbol: string]: number | string;
}

interface PerformanceChartProps {
  data: ChartDataPoint[];
  symbols: string[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isLoading?: boolean;
}

const TIME_RANGES = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const;

function formatDateLabel(dateString: string) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function normalizePerformanceData(
  data: ChartDataPoint[],
  symbols: string[]
): ChartDataPoint[] {
  const baselines: Record<string, number | null> = symbols.reduce(
    (acc, symbol) => ({ ...acc, [symbol]: null }),
    {}
  );

  data.forEach((point) => {
    symbols.forEach((symbol) => {
      const value = point[symbol];
      if (typeof value === "number" && baselines[symbol] === null && value !== 0) {
        baselines[symbol] = value;
      }
    });
  });

  return data.map((point) => {
    const normalizedPoint: ChartDataPoint = { date: point.date };

    symbols.forEach((symbol) => {
      const value = point[symbol];
      const baseline = baselines[symbol];

      if (typeof value === "number" && typeof baseline === "number" && baseline !== 0) {
        normalizedPoint[symbol] = (value / baseline) * 100;
      } else if (typeof value === "number") {
        normalizedPoint[symbol] = 0;
      }
    });

    return normalizedPoint;
  });
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border border-[#1f2937] bg-[#0b1221] p-3 shadow-lg">
      <div className="mb-2 text-xs text-gray-400">{formatDateLabel(label as string)}</div>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-3 text-sm text-white"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? "#60a5fa" }}
              />
              <span className="text-xs text-gray-200">{entry.dataKey}</span>
            </div>
            <span className="font-semibold">
              {typeof entry.value === "number" ? `${entry.value.toFixed(2)}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PerformanceChart({
  data,
  symbols,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: PerformanceChartProps) {
  const normalizedData = useMemo(
    () => normalizePerformanceData(data, symbols),
    [data, symbols]
  );

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-lg border border-[#1f2937] bg-[#0f172a] p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded-md bg-[#1f2937]" />
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <div
                key={range}
                className="h-8 w-10 animate-pulse rounded-md bg-[#1f2937]"
              />
            ))}
          </div>
        </div>
        <div className="h-72 animate-pulse rounded-md bg-[#1f2937]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-[#1f2937] bg-[#0f172a] p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Performance</h3>
          <p className="text-xs text-gray-400">Normalized performance since start</p>
        </div>
        <div className="flex gap-2">
          {TIME_RANGES.map((range) => {
            const isActive = range === timeRange;
            return (
              <button
                key={range}
                type="button"
                onClick={() => onTimeRangeChange(range)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-[#111827] text-gray-300 hover:bg-[#1f2937]"
                }`}
              >
                {range}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={normalizedData}
            margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            style={{ backgroundColor: "transparent" }}
          >
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              stroke="#1f2937"
            />
            <YAxis
              tickFormatter={(value) => `${value.toFixed ? value.toFixed(0) : value}%`}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              stroke="#1f2937"
              domain={[0, "dataMax + 20"]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#374151" }} />
            <Legend wrapperStyle={{ color: "#9ca3af" }} />
            {symbols.map((symbol, index) => (
              <Line
                key={symbol}
                type="monotone"
                dataKey={symbol}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function generateMockPerformanceData(
  symbols: string[],
  days = 90
): ChartDataPoint[] {
  if (!symbols.length) {
    return [];
  }

  const startPrices: Record<string, number> = symbols.reduce((acc, symbol) => {
    acc[symbol] = 80 + Math.random() * 60;
    return acc;
  }, {} as Record<string, number>);

  const data: ChartDataPoint[] = [];

  for (let i = 0; i < days; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));

    const point: ChartDataPoint = {
      date: date.toISOString(),
    };

    symbols.forEach((symbol) => {
      const previousValue =
        (data[i - 1]?.[symbol] as number | undefined) ?? startPrices[symbol];
      const changeFactor = 1 + (Math.random() - 0.5) / 25;
      const nextValue = Math.max(1, previousValue * changeFactor);

      point[symbol] = Number(nextValue.toFixed(2));
    });

    data.push(point);
  }

  return data;
}

// =============================================================================
// API Response Types
// =============================================================================

interface ChartAPIResponse {
  success: boolean;
  data?: {
    symbol: string;
    range: string;
    interval: string;
    data: Array<{
      timestamp: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
  error?: {
    code: string;
    message: string;
  };
}

// =============================================================================
// Data Combination Utilities
// =============================================================================

/**
 * Combine multiple symbol chart data into a single ChartDataPoint array
 * Each symbol becomes a key in the data points with its closing price
 */
function combineChartData(
  chartsData: Array<{ symbol: string; data: OHLCV[] } | null>
): ChartDataPoint[] {
  // Filter out null/undefined and empty data
  const validCharts = chartsData.filter(
    (chart): chart is { symbol: string; data: OHLCV[] } =>
      chart !== null && chart.data.length > 0
  );

  if (validCharts.length === 0) {
    return [];
  }

  // Use the first chart's timestamps as the base
  const baseChart = validCharts[0];
  
  // Create a map of timestamp -> combined data point
  const dataMap = new Map<string, ChartDataPoint>();

  // Initialize with base chart timestamps
  baseChart.data.forEach((point) => {
    const dateKey = point.timestamp instanceof Date
      ? point.timestamp.toISOString()
      : new Date(point.timestamp).toISOString();
    
    dataMap.set(dateKey, {
      date: dateKey,
      [baseChart.symbol]: point.close,
    });
  });

  // Add other symbols' data
  validCharts.slice(1).forEach((chart) => {
    chart.data.forEach((point) => {
      const dateKey = point.timestamp instanceof Date
        ? point.timestamp.toISOString()
        : new Date(point.timestamp).toISOString();

      const existing = dataMap.get(dateKey);
      if (existing) {
        existing[chart.symbol] = point.close;
      }
    });
  });

  // Convert map to sorted array
  return Array.from(dataMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

// =============================================================================
// Connected Performance Chart
// =============================================================================

/**
 * Connected PerformanceChart that fetches real data from the API
 * Uses the terminal store for selected indices and time range
 */
export function ConnectedPerformanceChart() {
  const { selectedIndices, timeRange, setTimeRange } = useTerminalStore();

  // Default symbols if none selected
  const symbols = selectedIndices.length > 0 ? selectedIndices : ["SPY"];

  // Fetch chart data for each selected symbol
  const chartQueries = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["stock", "chart", symbol, timeRange],
      queryFn: async (): Promise<{ symbol: string; data: OHLCV[] }> => {
        const response = await fetch(
          `/api/stocks/${encodeURIComponent(symbol)}/chart?range=${timeRange}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch chart for ${symbol}`);
        }

        const json: ChartAPIResponse = await response.json();

        if (!json.success || !json.data) {
          throw new Error(json.error?.message ?? `No data for ${symbol}`);
        }

        return {
          symbol,
          data: json.data.data.map((point) => ({
            timestamp: new Date(point.timestamp),
            open: point.open,
            high: point.high,
            low: point.low,
            close: point.close,
            volume: point.volume,
          })),
        };
      },
      staleTime: timeRange === "1D" ? 60_000 : 5 * 60_000,
      enabled: Boolean(symbol),
    })),
  });

  // Combine loading states
  const isLoading = chartQueries.some((q) => q.isLoading);
  const hasError = chartQueries.some((q) => q.isError);

  // Combine chart data from all queries
  const combinedData = useMemo(() => {
    const chartsData = chartQueries
      .filter((q) => q.isSuccess && q.data)
      .map((q) => q.data as { symbol: string; data: OHLCV[] });

    return combineChartData(chartsData);
  }, [chartQueries]);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    if (["1D", "1W", "1M", "3M", "1Y", "5Y"].includes(range)) {
      setTimeRange(range as "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y");
    }
  };

  // Show error state
  if (hasError && !isLoading && combinedData.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border border-[#1f2937] bg-[#0f172a] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Performance</h3>
            <p className="text-xs text-red-400">Failed to load chart data</p>
          </div>
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => handleTimeRangeChange(range)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  range === timeRange
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-[#111827] text-gray-300 hover:bg-[#1f2937]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="flex h-72 items-center justify-center text-gray-500">
          Unable to load performance data
        </div>
      </div>
    );
  }

  return (
    <PerformanceChart
      data={combinedData}
      symbols={symbols}
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      isLoading={isLoading}
    />
  );
}

export default PerformanceChart;
