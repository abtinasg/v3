"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useDebounce, useSearch, type SearchResult } from "@/hooks"

const RECENT_STORAGE_KEY = "symbol-search-recent"
const MAX_RECENT_ITEMS = 5

interface SymbolSearchProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (symbol: string) => void
}

export function SymbolSearch({ isOpen, onClose, onSelect }: SymbolSearchProps) {
  const [open, setOpen] = useState(isOpen)
  const [query, setQuery] = useState("")
  const [recent, setRecent] = useState<SearchResult[]>([])
  const debouncedQuery = useDebounce(query, 300)
  const { data: results = [], isLoading } = useSearch(debouncedQuery)

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = window.localStorage.getItem(RECENT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as SearchResult[]
        setRecent(parsed)
      }
    } catch (error) {
      console.error("Failed to load recent searches", error)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey
      const isKKey = event.key.toLowerCase() === "k"

      if (isModifierPressed && isKKey) {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const persistRecent = useCallback((items: SearchResult[]) => {
    try {
      window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error("Failed to store recent searches", error)
    }
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  const handleSelect = useCallback(
    (item: SearchResult) => {
      setRecent((prev) => {
        const filtered = prev.filter((entry) => entry.symbol !== item.symbol)
        const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS)
        persistRecent(updated)
        return updated
      })

      onSelect(item.symbol)
      handleClose()
    },
    [handleClose, onSelect, persistRecent]
  )

  const emptyMessage = useMemo(() => {
    if (isLoading) return "Searching..."

    const trimmed = query.trim()
    if (!trimmed) return "Type to search for stocks..."
    return `No stocks found for '${trimmed}'`
  }, [isLoading, query])

  return (
    <CommandDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose()
        } else {
          setOpen(true)
        }
      }}
    >
      <CommandInput
        autoFocus
        value={query}
        placeholder="Search stocks (⌘K)"
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>

        {recent.length > 0 && (
          <CommandGroup heading="Recent">
            {recent.map((item) => (
              <CommandItem
                key={`recent-${item.symbol}`}
                value={`${item.symbol} ${item.name}`}
                onSelect={() => handleSelect(item)}
              >
                <div className="flex flex-1 flex-col text-left">
                  <span className="font-semibold leading-tight">{item.symbol}</span>
                  <span className="text-muted-foreground text-xs">{item.name}</span>
                </div>
                <Badge variant="secondary" className="ml-2 text-[11px] font-medium">
                  {item.exchange}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Search results">
          {isLoading && (
            <CommandItem disabled>
              <div className="flex flex-1 flex-col text-left text-muted-foreground">
                Searching...
              </div>
            </CommandItem>
          )}
          {results.map((item) => (
            <CommandItem
              key={item.symbol}
              value={`${item.symbol} ${item.name}`}
              onSelect={() => handleSelect(item)}
            >
              <div className="flex flex-1 flex-col text-left">
                <span className="font-semibold leading-tight">{item.symbol}</span>
                <span className="text-muted-foreground text-xs">{item.name}</span>
              </div>
              <Badge variant="secondary" className="ml-2 text-[11px] font-medium">
                {item.exchange}
              </Badge>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default SymbolSearch
