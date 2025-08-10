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

        {/* Stake CTA Button */}
        <div className="mb-8 text-center">
          <a
            href="https://staking.succinct.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-mono font-bold py-3 px-6 md:py-4 md:px-8 rounded-lg shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-300"
          >
            <span className="text-lg md:text-xl">Stake Here</span>
            <svg 
              className="w-5 h-5 md:w-6 md:h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-3 font-mono">
            Start earning rewards by staking PROVE tokens
          </p>
        </div>

        {/* Staking Stats */}
        <Suspense fallback={<LoadingStats />}>
          <StakingStats />
        </Suspense>
      </main>
    </div>
  )
}

