"use client";

import { useMemo } from "react";
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

export default PerformanceChart;
