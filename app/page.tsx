'use client'

import { ReactElement } from "react"

export default function Home(): ReactElement {
  return (
    <div suppressHydrationWarning className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-8 bg-gradient-to-r from-pink-600 to-pink-500 p-12 rounded-lg shadow-lg shadow-pink-500/20 relative overflow-hidden gradient-border">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
              <h1
                className="text-4xl md:text-6xl font-mono font-bold relative z-10 neon-text text-white mb-4"
                data-text="Staking Stats"
              >
                Staking Stats
              </h1>
              <p className="text-xl md:text-2xl font-mono text-white/90 relative z-10">
                Coming Soon
              </p>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-lg">
              The future of decentralized staking analytics
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

