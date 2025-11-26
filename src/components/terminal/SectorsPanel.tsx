import type { MarketSector } from "@/types";
import { cn } from "@/lib/utils";

const MOCK_SECTORS: MarketSector[] = [
  { symbol: "XLK", name: "Technology", changePercent: 1.85, weekChange: 2.3, monthChange: 4.1, ytdChange: 18.5, volume: 12000000 },
  { symbol: "XLV", name: "Healthcare", changePercent: 0.45, weekChange: 0.8, monthChange: 1.2, ytdChange: 6.4, volume: 8500000 },
  { symbol: "XLY", name: "Consumer Discretionary", changePercent: 0.12, weekChange: -0.4, monthChange: 1.1, ytdChange: 5.8, volume: 6400000 },
  { symbol: "XLF", name: "Financials", changePercent: -0.32, weekChange: -0.1, monthChange: 0.6, ytdChange: 2.7, volume: 9100000 },
  { symbol: "XLE", name: "Energy", changePercent: -0.78, weekChange: -1.5, monthChange: -2.3, ytdChange: -4.2, volume: 7300000 },
  { symbol: "XLI", name: "Industrials", changePercent: -1.12, weekChange: -2.1, monthChange: -0.9, ytdChange: 1.5, volume: 5600000 },
];

interface SectorsPanelProps {
  sectors: MarketSector[];
  selectedSector: string | null;
  onSelect: (symbol: string) => void;
  isLoading?: boolean;
}

export function SectorsPanel({
  sectors,
  selectedSector,
  onSelect,
  isLoading = false,
}: SectorsPanelProps) {
  const displaySectors = (sectors.length ? sectors : MOCK_SECTORS)
    .slice()
    .sort((a, b) => b.changePercent - a.changePercent);

  const maxAbsChange = Math.max(
    ...displaySectors.map((sector) => Math.abs(sector.changePercent)),
    1
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          U.S. EQUITY SECTORS
        </div>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`sectors-loading-${index}`}
              className="h-12 animate-pulse rounded-md bg-[#1f2937]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        U.S. EQUITY SECTORS
      </div>
      <div className="space-y-2">
        {displaySectors.map((sector) => {
          const isSelected = selectedSector === sector.symbol;
          const barWidth = Math.max(
            8,
            (Math.abs(sector.changePercent) / maxAbsChange) * 100
          );
          const changeClass =
            sector.changePercent >= 0 ? "text-green-400" : "text-red-400";

          return (
            <button
              key={sector.symbol}
              type="button"
              onClick={() => onSelect(sector.symbol)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-transparent bg-[#1f2937] px-3 py-3 text-left transition-colors",
                "hover:bg-[#374151]",
                isSelected && "border-l-2 border-blue-500 bg-blue-500/10"
              )}
            >
              <div className="w-36 text-sm font-semibold text-white">
                {sector.name}
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-[#0f172a]">
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      sector.changePercent >= 0 ? "bg-green-500" : "bg-red-500"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className={cn("text-sm font-semibold", changeClass)}>
                  {`${sector.changePercent >= 0 ? "+" : ""}${sector.changePercent.toFixed(2)}%`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SectorsPanel;
