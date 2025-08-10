'use client'

import { ReactElement, Suspense } from "react"
import { StakingStats } from "@/components/staking/StakingStats"
import { LoadingStats } from "@/components/LoadingStats"

export default function Home(): ReactElement {
  return (
    <div suppressHydrationWarning className="min-h-screen">
      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg shadow-pink-500/20 relative overflow-hidden gradient-border">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
            <h1
              className="text-2xl sm:text-3xl md:text-5xl font-mono font-bold relative z-10 neon-text text-white mb-2"
              data-text="Staking Analytics"
            >
              Staking Analytics
            </h1>
            <p className="text-sm sm:text-lg md:text-xl font-mono text-white/90 relative z-10">
              Insights into the Succinct Prover Network staking ecosystem
            </p>
          </div>
        </div>

        {/* Staking Stats */}
        <Suspense fallback={<LoadingStats />}>
          <StakingStats />
        </Suspense>
      </main>
    </div>
  )
}

