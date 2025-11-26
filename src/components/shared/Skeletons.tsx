import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type SkeletonProps = {
  className?: string
}

type SkeletonTextProps = SkeletonProps & {
  width?: string
}

type SkeletonCardProps = SkeletonProps & {
  children?: ReactNode
}

const skeletonSurface = "animate-pulse bg-[#1f2937] rounded"

const SkeletonBlock = ({ className }: SkeletonProps) => (
  <div className={cn(skeletonSurface, className)} />
)

export const SkeletonTile = ({ className }: SkeletonProps) => (
  <SkeletonBlock className={cn("h-32 w-full", className)} />
)

export const SkeletonChart = ({ className }: SkeletonProps) => (
  <SkeletonBlock className={cn("w-full aspect-[2/1]", className)} />
)

export const SkeletonMetricRow = ({ className }: SkeletonProps) => (
  <div className={cn("flex w-full items-center justify-between gap-4", className)}>
    <SkeletonBlock className="h-4 w-32" />
    <SkeletonBlock className="h-4 w-16" />
  </div>
)

export const SkeletonCard = ({ className, children }: SkeletonCardProps) => (
  <div
    className={cn(
      "space-y-4 rounded-2xl border border-white/5 bg-black/30 p-4 backdrop-blur",
      className,
    )}
  >
    {children ?? (
      <>
        <SkeletonBlock className="h-5 w-32" />
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </>
    )}
  </div>
)

export const SkeletonText = ({ width = "w-2/3", className }: SkeletonTextProps) => (
  <SkeletonBlock className={cn("h-4", width, className)} />
)

export const SkeletonPanel = ({ className }: SkeletonProps) => (
  <SkeletonCard className={cn("space-y-6", className)}>
    <div className="space-y-2">
      <SkeletonText width="w-1/3" />
      <SkeletonText width="w-1/4" />
    </div>
    <SkeletonChart />
    <div className="space-y-3">
      <SkeletonMetricRow />
      <SkeletonMetricRow />
      <SkeletonMetricRow />
    </div>
  </SkeletonCard>
)
