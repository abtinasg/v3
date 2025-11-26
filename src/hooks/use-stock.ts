"use client"

import { useQuery } from "@tanstack/react-query"
import type {
  StockQuote,
  FundamentalMetrics,
  RiskMetrics,
  OHLCV,
} from "@/types"

// =============================================================================
// API Response Types
// =============================================================================

interface QuoteResponse {
  symbol: string
  name: string
  exchange: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  previousClose: number
  volume: number
  avgVolume: number
  marketCap: number
  peRatio: number | null
  weekHigh52: number
  weekLow52: number
  updatedAt: string
}

interface FundamentalsResponse extends FundamentalMetrics {}

interface RiskResponse extends RiskMetrics {}

interface ChartResponse {
  symbol: string
  range: string
  interval: string
  data: Array<{
    timestamp: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }>
}

interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: "stock" | "etf"
}

interface SearchResponse {
  results: SearchResult[]
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

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

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
// Stale Time Configuration
// =============================================================================

const STALE_TIME = {
  quote: 30_000, // 30 seconds
  fundamentals: 60 * 60 * 1000, // 1 hour
  risk: 60 * 60 * 1000, // 1 hour
  chart: {
    "1D": 60_000, // 1 minute for intraday
    "1W": 5 * 60_000, // 5 minutes
    "1M": 5 * 60_000, // 5 minutes
    "3M": 5 * 60_000, // 5 minutes
    "1Y": 5 * 60_000, // 5 minutes
    "5Y": 5 * 60_000, // 5 minutes
  },
} as const

type ChartRange = keyof typeof STALE_TIME.chart

// =============================================================================
// Stock Hooks
// =============================================================================

/**
 * Fetch real-time quote data for a stock
 * Refetches every 60 seconds
 */
export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ["stock", "quote", symbol],
    queryFn: async (): Promise<StockQuote> => {
      const data = await fetchAPI<QuoteResponse>(`/api/stocks/${encodeURIComponent(symbol)}/quote`)
      return {
        symbol: data.symbol,
        name: data.name,
        exchange: data.exchange,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.previousClose,
        previousClose: data.previousClose,
        volume: data.volume,
        avgVolume: data.avgVolume,
        marketCap: data.marketCap,
        updatedAt: new Date(data.updatedAt),
      }
    },
    enabled: Boolean(symbol),
    refetchInterval: 60_000, // 1 minute
    staleTime: STALE_TIME.quote,
  })
}

/**
 * Fetch fundamental metrics for a stock
 * Tier determined by user's subscription (handled server-side)
 * Stale time: 1 hour
 */
export function useFundamentals(symbol: string) {
  return useQuery({
    queryKey: ["stock", "fundamentals", symbol],
    queryFn: async (): Promise<FundamentalMetrics> => {
      const data = await fetchAPI<FundamentalsResponse>(
        `/api/stocks/${encodeURIComponent(symbol)}/fundamentals`
      )
      return data
    },
    enabled: Boolean(symbol),
    staleTime: STALE_TIME.fundamentals,
  })
}

/**
 * Fetch risk metrics for a stock
 * Stale time: 1 hour
 */
export function useRisk(symbol: string) {
  return useQuery({
    queryKey: ["stock", "risk", symbol],
    queryFn: async (): Promise<RiskMetrics> => {
      const data = await fetchAPI<RiskResponse>(
        `/api/stocks/${encodeURIComponent(symbol)}/risk`
      )
      return data
    },
    enabled: Boolean(symbol),
    staleTime: STALE_TIME.risk,
  })
}

/**
 * Fetch historical OHLCV chart data for a stock
 * Stale time varies by range
 */
export function useChart(symbol: string, range: string = "1M") {
  const validRange = (
    ["1D", "1W", "1M", "3M", "1Y", "5Y"].includes(range) ? range : "1M"
  ) as ChartRange

  return useQuery({
    queryKey: ["stock", "chart", symbol, validRange],
    queryFn: async (): Promise<OHLCV[]> => {
      const data = await fetchAPI<ChartResponse>(
        `/api/stocks/${encodeURIComponent(symbol)}/chart?range=${validRange}`
      )
      return data.data.map((point) => ({
        timestamp: new Date(point.timestamp),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
      }))
    },
    enabled: Boolean(symbol),
    staleTime: STALE_TIME.chart[validRange],
  })
}

/**
 * Search for stock/ETF symbols
 * Enabled when query length >= 1
 */
export function useSearch(query: string) {
  const trimmedQuery = query.trim()

  return useQuery({
    queryKey: ["stock", "search", trimmedQuery],
    queryFn: async (): Promise<SearchResult[]> => {
      const data = await fetchAPI<SearchResponse>("/api/stocks/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmedQuery }),
      })
      return data.results
    },
    enabled: trimmedQuery.length >= 1,
    staleTime: 5 * 60_000, // 5 minutes
  })
}

// Export search result type for consumers
export type { SearchResult }
