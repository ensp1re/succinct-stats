'use client'

import { ReactElement, Suspense, useEffect, useState } from "react"
import { Leaderboard } from "@/components/Leaderboard"
import { NetworkStats } from "@/components/NetworkStats"
import { LoadingStats } from "@/components/LoadingStats"
import { StarDistribution } from "@/components/StarDistribution"
import { ExternalLink, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { InvitersLeaderboard } from "@/components/InvitersLeaderboard"
import { ActivityChart } from "@/components/ActivityChart"
import { EarlyAccess } from "@/components/EarlyAccess"
import { ProofsLeaderboard } from "@/components/ProofsLeaderboard"
import { getTotalEntries } from "@/lib/csv-service"
import { UnifiedUserSearch } from "@/components/UnitedSearch"
import { RoleStats } from "@/components/RoleStats"

export default function TestnetStats(): ReactElement {


  const [remainingSpots, setRemainingSpots] = useState<number>(0)


  useEffect(() => {
    const fetchRemainingSpots = async () => {
      try {
        const response = await getTotalEntries()
        setRemainingSpots(25000 - response.totalEntries)
      } catch (error) {
        console.error("Error fetching remaining spots:", error)
      }
    }

    fetchRemainingSpots()
  }, [])


  return (
    <div suppressHydrationWarning className="min-h-screen">
      {/* <RunningCrab speed={5} escapeDistance={150} size={50} enableSound={false} />
      <RunningCrab
        speed={3}
        escapeDistance={200}
        size={40}
        initialPosition={{ x: 100, y: 100 }}
        enableSound={false} />
      <RunningCrab
        speed={7}
        escapeDistance={180}
        size={30}
        initialPosition={{ x: 400, y: 400 }}
        enableSound={false} /> */}
      <main className="container mx-auto px-4 py-8">
        {/* Testnet Ended Message */}
        <div className="mb-6 bg-gradient-to-r from-cyan-600 to-cyan-500 p-6 rounded-lg shadow-lg shadow-cyan-500/20 relative overflow-hidden border border-cyan-300/50 dark:border-cyan-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent"></div>
          <div className="flex items-center space-x-3 relative z-10">
            <AlertTriangle className="h-6 w-6 text-white" />
            <h2 className="text-xl font-mono font-bold text-white neon-cyan">
              TESTNET HAS ENDED
            </h2>
          </div>
          <p className="mt-2 text-white/90 relative z-10">
            The Succinct testnet has concluded. All stats below are final results from the testnet period.
          </p>
        </div>

        <div className="mb-8 bg-gradient-to-r from-pink-600 to-pink-500 p-6 rounded-lg shadow-lg shadow-pink-500/20 relative overflow-hidden gradient-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
          <h2
            className="text-xl font-mono font-bold relative z-10 neon-text text-white"
            data-text="Play games to earn stars."
          >
            Play games to earn stars.{" "}
            <Link href="/earn" className="underline hover:text-white">
              Games →
            </Link>
          </h2>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <UnifiedUserSearch />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <EarlyAccess totalSpots={25000} remainingSpots={remainingSpots} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Suspense fallback={<LoadingStats />}>
            <NetworkStats />
          </Suspense>
          <Suspense fallback={<LoadingStats />}>
            <StarDistribution />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <Leaderboard />
          </Suspense>
        </div>
        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <InvitersLeaderboard />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <ProofsLeaderboard />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <ActivityChart />
          </Suspense>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <RoleStats />
          </Suspense>
        </div>

        <div className="bg-white dark:bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 text-center mb-8">
          <h2 className="text-xl font-mono font-bold mb-2 text-cyan-600 dark:text-cyan-400 neon-cyan">
            EXPLORE THE DOCUMENTATION
          </h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Learn more about Succinct's technology, proofs, and how to participate in the network.
          </p>
          <a
            href="https://docs.succinct.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-gradient-to-r from-cyan-600 to-cyan-500 text-white px-6 py-3 rounded-md font-mono hover:from-cyan-700 hover:to-cyan-600 transition-colors duration-200"
          >
            VIEW DOCUMENTATION
            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </main>
    </div>
  )
}
