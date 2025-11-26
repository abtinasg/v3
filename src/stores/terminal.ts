"use client"

import { create } from "zustand"

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y"

interface TerminalState {
  /** Currently selected index symbols for highlighting */
  selectedIndices: string[]
  /** Toggle selection of an index symbol */
  toggleIndex: (symbol: string) => void
  /** Clear all selected indices */
  clearIndices: () => void
  /** Set specific selected indices */
  setSelectedIndices: (symbols: string[]) => void

  /** Currently selected sector symbol */
  selectedSector: string | null
  /** Select a sector (or deselect if same) */
  selectSector: (symbol: string) => void
  /** Clear sector selection */
  clearSector: () => void

  /** Chart time range */
  timeRange: TimeRange
  /** Set the chart time range */
  setTimeRange: (range: TimeRange) => void
}

export const useTerminalStore = create<TerminalState>((set) => ({
  selectedIndices: [],

  toggleIndex: (symbol) =>
    set((state) => ({
      selectedIndices: state.selectedIndices.includes(symbol)
        ? state.selectedIndices.filter((s) => s !== symbol)
        : [...state.selectedIndices, symbol],
    })),

  clearIndices: () => set({ selectedIndices: [] }),

  setSelectedIndices: (symbols) => set({ selectedIndices: symbols }),

  selectedSector: null,

  selectSector: (symbol) =>
    set((state) => ({
      selectedSector: state.selectedSector === symbol ? null : symbol,
    })),

  clearSector: () => set({ selectedSector: null }),

  timeRange: "1M",

  setTimeRange: (range) => set({ timeRange: range }),
}))
