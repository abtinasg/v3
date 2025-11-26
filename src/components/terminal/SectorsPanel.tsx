"use client"

import type { MarketSector } from "@/types"
import { cn } from "@/lib/utils"
import { useSectors } from "@/hooks"
import { useTerminalStore } from "@/stores"

export function SectorsPanel() {
  const { data: sectors, isLoading, error } = useSectors()
  const { selectedSector, selectSector } = useTerminalStore()

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
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          U.S. EQUITY SECTORS
        </div>
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-4 text-center">
          <p className="text-sm text-red-400">Failed to load sectors</p>
          <p className="text-xs text-gray-500 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  const displaySectors = (sectors ?? [])
    .slice()
    .sort((a, b) => b.changePercent - a.changePercent)

  const maxAbsChange = Math.max(
    ...displaySectors.map((sector) => Math.abs(sector.changePercent)),
    1
  )

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        U.S. EQUITY SECTORS
      </div>
      <div className="space-y-2">
        {displaySectors.map((sector) => {
          const isSelected = selectedSector === sector.symbol
          const barWidth = Math.max(
            8,
            (Math.abs(sector.changePercent) / maxAbsChange) * 100
          )
          const changeClass =
            sector.changePercent >= 0 ? "text-green-400" : "text-red-400"

          return (
            <button
              key={sector.symbol}
              type="button"
              onClick={() => selectSector(sector.symbol)}
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
          )
        })}
      </div>
    </div>
  )
}

export default SectorsPanel
