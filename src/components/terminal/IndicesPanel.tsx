"use client"

import type { MarketIndex } from "@/types"
import { cn } from "@/lib/utils"
import { useIndices } from "@/hooks"
import { useTerminalStore } from "@/stores"

interface IndicesPanelProps {
  onExplain?: (symbol: string) => void
}

export function IndicesPanel({ onExplain }: IndicesPanelProps) {
  const { data: indices, isLoading, error } = useIndices()
  const { selectedIndices, toggleIndex } = useTerminalStore()

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

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-xs uppercase tracking-wide text-gray-500">
          U.S. EQUITY MARKETS
        </div>
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-4 text-center">
          <p className="text-sm text-red-400">Failed to load indices</p>
          <p className="text-xs text-gray-500 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  const displayIndices = indices ?? []

  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-wide text-gray-500">
        U.S. EQUITY MARKETS
      </div>
      <div className="space-y-2">
        {displayIndices.map((index) => {
          const isSelected = selectedIndices.includes(index.symbol)
          const changeClass = index.change >= 0 ? "text-green-400" : "text-red-400"
          const changeLabel = `${index.change >= 0 ? "+" : ""}${index.change.toFixed(2)} (${index.changePercent.toFixed(2)}%)`

          return (
            <button
              key={index.symbol}
              type="button"
              onClick={() => toggleIndex(index.symbol)}
              onDoubleClick={() => onExplain?.(index.symbol)}
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
          )
        })}
      </div>
    </div>
  )
}

export default IndicesPanel
