"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, AlertCircle, Twitter, Sparkles, User, ArrowRight } from "lucide-react"
import { getEntryByUsername } from "@/lib/csv-service"
import { LeaderboardEntry } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic"

const ShareStats = dynamic(() => import('@/components/ShareStats'))


export function UserSearch() {
  const [username, setUsername] = useState<string>("")
  const [userStats, setUserStats] = useState<LeaderboardEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const [isFocused, setIsFocused] = useState<boolean>(false)
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
    setTimeout(async () => {
      try {
        const result = await getEntryByUsername(username.trim())


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
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 overflow-hidden">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30 bg-gradient-to-r from-white to-pink-50/50 dark:from-black dark:to-pink-950/20">
        <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          FIND YOUR STATS
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-16 h-16 bg-pink-500/5 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className={`relative flex-1 group ${isFocused ? "ring-2 ring-pink-500 rounded-md" : ""}`}>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className={`h-5 w-5 ${isFocused ? "text-pink-500" : "text-gray-400 dark:text-gray-600"}`} />
                </div>
                <Input
                  type="text"
                  placeholder="Enter your X (Twitter) username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 rounded-md pl-10 pr-4 py-2 text-gray-800 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
                />
                {username && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      onClick={() => setUsername("")}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400"
                    >
                      <span className="sr-only">Clear input</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <Button
                id="search-button"
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-mono shadow-md hover:shadow-lg  transition-all duration-200"
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
              <div className="bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-md p-4 mb-4 flex items-start animate-fadeIn">
                <AlertCircle className="text-pink-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-pink-700 dark:text-pink-200">{error}</p>
                  <p className="text-pink-600/70 dark:text-pink-300/70 text-sm mt-1">
                    Try searching for another username or check if you've typed it correctly.
                  </p>
                </div>
              </div>
            )}

            {userStats && (
              <div className="bg-gradient-to-br from-white to-pink-50/50 dark:from-black dark:to-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-md p-6 animate-fadeIn shadow-md">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div className="flex items-start">
                    <div>
                      <a
                        href={`https://twitter.com/${userStats.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl text-pink-500 hover:text-pink-600 dark:hover:text-pink-600 font-mono inline-flex items-center group transition-colors duration-500"
                      >
                        {userStats.name}
                        <Twitter className="w-5 h-5 ml-1" />
                      </a>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Invited by: {userStats.invitedBy !== "-" ? userStats.invitedBy : "None"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex-1 bg-pink-50 dark:bg-pink-950/30 px-4 py-2 rounded-md border border-pink-300/50 dark:border-pink-900/50 shadow-sm text-center flex flex-col items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">RANK</span>
                        <div className="text-2xl font-bold text-pink-500 font-mono break-words text-center">{userStats.rank}</div>
                      </div>
                      <div className="flex-1 bg-pink-50 dark:bg-pink-950/30 px-4 py-2 rounded-md border border-pink-300/50 dark:border-pink-900/50 shadow-sm text-center flex flex-col items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">TOP</span>
                        <div className="text-2xl font-bold text-pink-500 font-mono break-words">
                          {userStats.topPercent}%
                        </div>
                      </div>
                    </div>
                    <ShareStats user={userStats} progress={progress} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">STARS</h3>
                      <div className="flex items-center">
                        <Star className="text-pink-500 w-4 h-4 mr-1" />
                        <span className="text-gray-800 dark:text-white font-mono">{Number(userStats.stars).toLocaleString()}</span>
                      </div>
                    </div>
                    <Progress value={progress.stars} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                      <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" />
                    </Progress>
                  </div>

                  <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">PROOFS</h3>
                      <span className="text-gray-800 dark:text-white font-mono">{Number(userStats.proofs).toLocaleString()}</span>
                    </div>
                    <Progress value={progress.proofs} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                      <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                    </Progress>
                  </div>

                  <div className="bg-white/50 dark:bg-black/50 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30 shadow-sm">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-cyan-600 dark:text-cyan-400 font-mono">CYCLES</h3>
                      <span className="text-gray-800 dark:text-white font-mono">
                        {Number(userStats.cycles).toLocaleString()}

                      </span>
                    </div>
                    <Progress value={progress.cycles} className="h-3 bg-pink-100 dark:bg-pink-900/30">
                      <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full" />
                    </Progress>
                  </div>
                </div>

                <div className="text-center mt-6 bg-gradient-to-r from-pink-500/10 to-cyan-500/10 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                  <a
                    href="/earn"
                    className="text-pink-500 hover:text-pink-600 dark:hover:text-pink-300 text-sm font-mono inline-flex items-center group"
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Learn how to earn more stars
                    <ArrowRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                </div>
              </div>
            )}

            {!userStats && !error && (
              <div className="text-center py-10 text-gray-600 dark:text-gray-400 bg-gradient-to-br from-white to-pink-50/30 dark:from-black dark:to-pink-950/10 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                <div className="w-16 h-16 mx-auto mb-4 bg-pink-500/10 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-pink-400 dark:text-pink-500/50" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Find Your Succinct Stats</h3>
                <p>Enter your X (Twitter) username to find your stats on the Succinct network.</p>
                <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">Example: @username or username</p>

                <div className="mt-6 flex justify-center space-x-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-pink-500" />
                    </div>
                    <span className="text-xs">View Stars</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                      <svg className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs">Check Proofs</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                      <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs">Track Cycles</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


