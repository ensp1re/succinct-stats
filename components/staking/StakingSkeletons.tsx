"use client"

import { ReactElement } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SummaryCardSkeleton(): ReactElement {
  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ProverCardSkeleton(): ReactElement {
  return (
    <Card className="border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 bg-white dark:bg-black">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-20 mb-1" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
              <Skeleton className="h-3 w-16 mb-1" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
              <Skeleton className="h-3 w-14 mb-1" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TableSkeleton(): ReactElement {
  return (
    <div className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 rounded-lg overflow-hidden">
      <div className="border-b border-pink-300/30 dark:border-pink-900/30 p-4">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="border-t border-pink-300/30 dark:border-pink-900/30 p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton(): ReactElement {
  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Skeleton className="h-[300px] w-full mb-4" />
        <div className="p-4 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function PieChartSkeleton(): ReactElement {
  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80 flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
        <div className="mt-4 p-4 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
