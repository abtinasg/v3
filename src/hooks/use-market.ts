"use client"

import { useQuery } from "@tanstack/react-query"
import type {
  MarketIndex,
  MarketSector,
  MacroIndicator,
  TreasuryYield,
  NewsItem,
} from "@/types"

// =============================================================================
// API Response Types
// =============================================================================

interface IndicesResponse {
  indices: MarketIndex[]
}

interface SectorsResponse {
  sectors: MarketSector[]
}

interface MacroResponse {
  indicators: MacroIndicator[]
  yields: TreasuryYield[]
}

interface NewsResponse {
  items: NewsItem[]
}

interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

// =============================================================================
// Fetcher Utilities
// =============================================================================

async function fetchAPI<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const json: APIResponse<T> = await response.json()

  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? "Unknown API error")
  }

  return json.data
}

// =============================================================================
// Market Hooks
// =============================================================================

/**
 * Fetch major market indices (S&P 500, NASDAQ, etc.)
 * Refetches every 1 minute
 */
export function useIndices() {
  return useQuery({
    queryKey: ["market", "indices"],
    queryFn: async () => {
      const data = await fetchAPI<IndicesResponse>("/api/market/indices")
      return data.indices
    },
    refetchInterval: 60_000, // 1 minute
  })
}

/**
 * Fetch sector performance data
 * Refetches every 1 minute
 */
export function useSectors() {
  return useQuery({
    queryKey: ["market", "sectors"],
    queryFn: async () => {
      const data = await fetchAPI<SectorsResponse>("/api/market/sectors")
      return data.sectors
    },
    refetchInterval: 60_000, // 1 minute
  })
}

/**
 * Fetch macroeconomic indicators and treasury yields
 * Stale time of 15 minutes (data updates infrequently)
 */
export function useMacro() {
  return useQuery({
    queryKey: ["market", "macro"],
    queryFn: () => fetchAPI<MacroResponse>("/api/market/macro"),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Fetch market news feed
 * Optional filter by stock symbols
 * Refetches every 5 minutes
 */
export function useNews(symbols?: string[]) {
  const params = new URLSearchParams()
  if (symbols && symbols.length > 0) {
    params.set("symbols", symbols.join(","))
  }

  const queryString = params.toString()
  const url = queryString ? `/api/market/news?${queryString}` : "/api/market/news"

  return useQuery({
    queryKey: ["market", "news", symbols ?? []],
    queryFn: async () => {
      const data = await fetchAPI<NewsResponse>(url)
      return data.items
    },
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  })
}
