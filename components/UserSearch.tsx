"use client"

import type React from "react"

import { Suspense, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, AlertCircle, Twitter } from "lucide-react"
import { getEntryByUsername } from "@/lib/csv-service"
import type { LeaderboardEntry } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic"

const ShareStats = dynamic(() => import('@/components/ShareStats'))


export function UserSearch() {
  const [username, setUsername] = useState<string>("")
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const [progress, setProgress] = useState<{
    proofs: number
    cycles: number
    stars: number
  }>({
    proofs: 0,
    cycles: 0,
    stars: 0,
  })

  const handleSearch = () => {
    if (!username.trim()) {
      setError("Please enter a username")
      return
    }

    setIsSearching(true)
    setError(null)

    // Simulate API call delay
    setTimeout(async () => {
      try {
        const result = await getEntryByUsername(username)




        if (result) {
          setUserStats({ ...result.data, topPercent: result.topPercentage })
          setProgress(result.progress)
          setError(null)
        } else {
          setUserStats(null)
          setError("User not found. Please check the username and try again.")
        }
      } catch (error) {
        setUserStats(null)
        setError("User not found. Please check the username and try again.")
      } finally {
        setIsSearching(false)
      }
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <Card className="bg-black border border-pink-900/50 shadow-lg shadow-pink-500/10">
      <CardHeader className="border-b border-pink-900/30">
        <CardTitle className="text-xl font-mono text-pink-500">FIND YOUR STATS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter your X (Twitter) username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-black border border-pink-900/50 rounded-md px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-pink-600 hover:bg-pink-700 text-white font-mono"
          >
            {isSearching ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                SEARCHING...
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                SEARCH
              </div>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-pink-950/20 border border-pink-900/50 rounded-md p-4 mb-4 flex items-start">
            <AlertCircle className="text-pink-500 mr-2 h-5 w-5 mt-0.5" />
            <p className="text-pink-200">{error}</p>
          </div>
        )}

        {userStats && (
          <div className="bg-gradient-to-br from-black to-pink-950/20 border border-pink-900/50 rounded-md p-6 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h3 className="text-2xl font-mono text-white mb-1">
                  <Link
                    href={`https://x.com/${userStats.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 hover:text-pink-400 font-mono text-2xl flex items-center"
                  >
                    {userStats.name}
                    <Twitter className="ml-1 w-4 h-4" />
                  </Link>
                </h3>
                <p className="text-gray-400 text-sm">
                  Invited by: {userStats.invitedBy !== "-" ? userStats.invitedBy : "None"}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="bg-pink-950/30 px-4 py-2 rounded-md border border-pink-900/50">
                    <span className="text-gray-400 text-sm font-mono">RANK</span>
                    <div className="text-2xl font-bold text-pink-500 font-mono">{userStats.rank}</div>
                  </div>
                  <div className="bg-pink-950/30 px-4 py-2 rounded-md border border-pink-900/50">
                    <span className="text-gray-400 text-sm font-mono">TOP</span>
                    <div className="text-2xl font-bold text-pink-500 font-mono">
                      {userStats.topPercent}%
                    </div>
                  </div>
                </div>
                <Suspense fallback={null}>
                  <ShareStats user={userStats} />
                </Suspense>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-cyan-400 font-mono">STARS</h3>
                  <div className="flex items-center">
                    <Star className="text-pink-500 w-4 h-4 mr-1" />
                    <span className="text-white font-mono">{userStats.stars}</span>
                  </div>
                </div>
                <Progress value={progress.stars} className="h-3 bg-pink-900/30">
                  <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" />
                </Progress>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-cyan-400 font-mono">PROOFS</h3>
                  <span className="text-white font-mono">{userStats.proofs}</span>
                </div>
                <Progress value={progress.proofs} className="h-3 bg-pink-900/30">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                </Progress>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <h3 className="text-cyan-400 font-mono">CYCLES</h3>
                  <span className="text-white font-mono">{userStats.cycles}</span>
                </div>
                <Progress value={progress.cycles} className="h-3 bg-pink-900/30">
                  <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                </Progress>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link
                href="/earn"
                className="text-pink-400 hover:text-pink-300 text-sm font-mono inline-flex items-center"
              >
                <Star className="w-3 h-3 mr-1" />
                Learn how to earn more stars
              </Link>
            </div>
          </div>
        )}

        {!userStats && !error && (
          <div className="text-center py-6 text-gray-400">
            <Search className="mx-auto h-8 w-8 mb-2 text-pink-500/50" />
            <p>Enter your X (Twitter) username to find your stats on the Succinct network.</p>
            <p className="text-sm mt-2">Example: @username or username</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add this to your globals.css or create a new animation
const Link = ({ children, href, className, target, rel }: { children: React.ReactNode; href: string; className?: string; target?: string; rel?: string }) => {
  return (
    <a href={href} className={className} target={target} rel={rel}>
      {children}
    </a>
  )
}

