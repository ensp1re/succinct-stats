import { ReactElement, Suspense } from "react"
import { Leaderboard } from "@/components/Leaderboard"
import { NetworkStats } from "@/components/NetworkStats"
import { LoadingStats } from "@/components/LoadingStats"
import { UserSearch } from "@/components/UserSearch"
import { StarDistribution } from "@/components/StarDistribution"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

export default function Home(): ReactElement {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 bg-gradient-to-r from-pink-600 to-pink-500 p-6 rounded-lg shadow-lg shadow-pink-500/20 relative overflow-hidden gradient-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent"></div>
          <h2 className="text-xl font-mono font-bold relative z-10 neon-text" data-text="Play games to earn stars.">
            Play games to earn stars.{" "}
            <Link href="/earn" className="underline hover:text-white">
              Games →
            </Link>
          </h2>
        </div>

        <div className="mb-8">
          <Suspense fallback={<LoadingStats />}>
            <UserSearch />
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
          <h2 className="text-2xl font-mono font-bold mb-4 text-pink-500 neon-text">LEADERBOARD</h2>
          <Suspense fallback={<LoadingStats />}>
            <Leaderboard />
          </Suspense>
        </div>

        <div className="bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-pink-900/50 shadow-lg shadow-pink-500/10 text-center mb-8">
          <h2 className="text-xl font-mono font-bold mb-2 neon-cyan">EXPLORE THE DOCUMENTATION</h2>
          <p className="mb-4 text-gray-300">
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

