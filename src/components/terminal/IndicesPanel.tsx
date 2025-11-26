import type { MarketIndex } from "@/types";
import { cn } from "@/lib/utils";

const MOCK_INDICES: MarketIndex[] = [
  {
    symbol: "SPY",
    name: "S&P 500",
    price: 595.42,
    change: 5.23,
    changePercent: 0.89,
    previousClose: 590.19,
    dayHigh: 600.0,
    dayLow: 590.0,
    volume: 25000000,
    updatedAt: new Date(),
  },
  {
    symbol: "DIA",
    name: "Dow Jones",
    price: 438.15,
    change: -2.1,
    changePercent: -0.48,
    previousClose: 440.25,
    dayHigh: 441.0,
    dayLow: 437.5,
    volume: 18000000,
    updatedAt: new Date(),
  },
  {
    symbol: "QQQ",
    name: "Nasdaq 100",
    price: 505.3,
    change: 8.45,
    changePercent: 1.7,
    previousClose: 496.85,
    dayHigh: 507.75,
    dayLow: 498.0,
    volume: 32000000,
    updatedAt: new Date(),
  },
  {
    symbol: "IWM",
    name: "Russell 2000",
    price: 223.67,
    change: 1.02,
    changePercent: 0.46,
    previousClose: 222.65,
    dayHigh: 224.75,
    dayLow: 221.9,
    volume: 15000000,
    updatedAt: new Date(),
  },
];

interface IndicesPanelProps {
  indices: MarketIndex[];
  selectedSymbols: string[];
  onSelect: (symbol: string) => void;
  onExplain: (symbol: string) => void;
  isLoading?: boolean;
}

export function IndicesPanel({
  indices,
  selectedSymbols,
  onSelect,
  onExplain,
  isLoading = false,
}: IndicesPanelProps) {
  const displayIndices = indices.length ? indices : MOCK_INDICES;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          U.S. EQUITY MARKETS
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`indices-loading-${index}`}
              className="h-14 animate-pulse rounded-md bg-[#1f2937]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        U.S. EQUITY MARKETS
      </div>
      <div className="space-y-2">
        {displayIndices.map((index) => {
          const isSelected = selectedSymbols.includes(index.symbol);
          const changeClass = index.change >= 0 ? "text-green-400" : "text-red-400";
          const changeLabel = `${index.change >= 0 ? "+" : ""}${index.change.toFixed(2)} (${index.changePercent.toFixed(2)}%)`;

          return (
            <button
              key={index.symbol}
              type="button"
              onClick={() => onSelect(index.symbol)}
              onDoubleClick={() => onExplain(index.symbol)}
              className={cn(
                "flex w-full items-center justify-between rounded-md border border-transparent bg-[#1f2937] px-3 py-3 text-left transition-colors",
                "hover:bg-[#374151]",
                isSelected && "border-l-2 border-blue-500 bg-blue-500/10"
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{index.symbol}</span>
                <span className="text-xs text-gray-400">{index.name}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {index.price.toFixed(2)}
                </div>
                <div className={cn("text-xs", changeClass)}>{changeLabel}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default IndicesPanel;
