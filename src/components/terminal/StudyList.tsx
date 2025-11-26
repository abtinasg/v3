"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useStudyList, useAddToStudyList, useRemoveFromStudyList } from "@/hooks/use-user"
import { SymbolSearch } from "@/components/shared/SymbolSearch"

export interface StudyListItem {
  id: string
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export function StudyList() {
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { data: studyListData, isLoading, error } = useStudyList()
  const addMutation = useAddToStudyList()
  const removeMutation = useRemoveFromStudyList()

  const items: StudyListItem[] = (studyListData?.items ?? []).map((item) => ({
    id: item.id,
    symbol: item.symbol,
    name: item.name,
    price: item.currentPrice ?? 0,
    change: item.change ?? 0,
    changePercent: item.changePercent ?? 0,
  }))

  const limit = studyListData?.limit ?? 10
  const canAdd = studyListData?.canAdd ?? false
  const hasItems = items.length > 0
  const itemCountLabel = `${items.length}/${limit}`

  const handleSelect = (symbol: string) => {
    router.push(`/stock/${symbol}`)
  }

  const handleRemove = (id: string) => {
    removeMutation.mutate(id)
  }

  const handleAdd = () => {
    setIsSearchOpen(true)
  }

  const handleSearchSelect = (symbol: string) => {
    addMutation.mutate(symbol)
    setIsSearchOpen(false)
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-xl bg-[#0f172a] p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>My Study List</span>
        </div>
        <div className="rounded-md bg-red-500/10 border border-red-500/20 px-3 py-4 text-center">
          <p className="text-sm text-red-400">Failed to load study list</p>
          <p className="text-xs text-gray-500 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-xl bg-[#0f172a] p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>My Study List</span>
          <span className="rounded-md bg-[#1f2937] px-2 py-1 text-[11px] text-gray-300">—/—</span>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`study-list-loading-${index}`} className="h-14 animate-pulse rounded-md bg-[#1f2937]" />
          ))}
        </div>
      </div>
    )
  }

  if (!hasItems) {
    return (
      <>
        <SymbolSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelect={handleSearchSelect}
        />
        <div className="flex flex-col items-center justify-center space-y-4 rounded-xl bg-[#0f172a] p-6 text-center text-gray-300">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1f2937] text-xl text-gray-200">+
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-white">Add stocks to your study list</div>
            <div className="text-xs text-gray-400">Save tickers you want to research later.</div>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd || addMutation.isPending}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition",
              canAdd && !addMutation.isPending
                ? "bg-blue-600 hover:bg-blue-500"
                : "cursor-not-allowed bg-[#1f2937] text-gray-500"
            )}
          >
            <span className="text-lg leading-none">+</span>
            <span>{addMutation.isPending ? "Adding..." : "Add"}</span>
            <span className="rounded bg-black/30 px-2 py-0.5 text-[11px] font-medium">{itemCountLabel}</span>
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <SymbolSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
      <div className="space-y-3 rounded-xl bg-[#0f172a] p-4">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-400">
          <span>My Study List</span>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#1f2937] px-2 py-1 text-[11px] text-gray-300">{itemCountLabel}</span>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!canAdd || addMutation.isPending}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition",
                canAdd && !addMutation.isPending
                  ? "bg-blue-600 text-white hover:bg-blue-500"
                  : "cursor-not-allowed bg-[#1f2937] text-gray-500"
              )}
            >
              <span className="text-lg leading-none">+</span>
              <span>{addMutation.isPending ? "Adding..." : "Add"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const changePositive = item.changePercent >= 0
            const changeClass = changePositive ? "text-green-400" : "text-red-400"
            const changeLabel = `${changePositive ? "+" : ""}${item.change.toFixed(2)} (${item.changePercent.toFixed(2)}%)`
            const isRemoving = removeMutation.isPending && removeMutation.variables === item.id

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative flex items-center justify-between rounded-md bg-[#111827] px-3 py-3 transition hover:bg-[#1f2937]",
                  isRemoving && "opacity-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => handleSelect(item.symbol)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white">{item.symbol}</span>
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{item.price.toFixed(2)}</div>
                    <div className={cn("text-xs", changeClass)}>{changeLabel}</div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.symbol}`}
                  disabled={isRemoving}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleRemove(item.id)
                  }}
                  className="absolute right-2 top-2 rounded p-1 text-gray-500 opacity-0 transition hover:bg-[#1f2937] hover:text-white group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default StudyList
