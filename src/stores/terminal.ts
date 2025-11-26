"use client"

import { create } from "zustand"

interface TerminalState {
  /** Currently selected index symbols for highlighting */
  selectedIndices: string[]
  /** Toggle selection of an index symbol */
  toggleIndex: (symbol: string) => void
  /** Clear all selected indices */
  clearIndices: () => void
  /** Set specific selected indices */
  setSelectedIndices: (symbols: string[]) => void
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
}))
