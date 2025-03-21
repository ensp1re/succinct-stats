"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"

export function StarDistribution() {
  const [ranges, setRanges] = useState<{ range: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async (retries = 3) => {
      try {
        const response = await fetch("/api/leaderboard?action=getStarRanges")
        if (!response.ok) throw new Error("Network response was not ok")
        const data = await response.json()
        setRanges(data)
      } catch (error) {
        if (retries > 0) {
          console.warn(`Retrying... (${3 - retries + 1})`)
          fetchData(retries - 1)
        } else {
          console.error("Error fetching star ranges:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Calculate the maximum count to normalize the bar widths
  const maxCount = Math.max(...ranges.map((r) => r.count), 1)

  return (
    <Card className="bg-black border border-pink-900/50 shadow-lg shadow-pink-500/10">
      <CardHeader className="border-b border-pink-900/30">
        <CardTitle className="text-xl font-mono text-pink-500">STAR DISTRIBUTION</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {ranges.map((range, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-pink-500 mr-2" />
                    <span className="text-white font-mono">{range.range} stars</span>
                  </div>
                  <span className="text-cyan-400 font-mono">{range.count} users</span>
                </div>
                <div className="w-full bg-pink-900/20 rounded-full h-3">
                  <div
                    className={`h-full rounded-full ${index % 2 === 0 ? "bg-gradient-to-r from-pink-600 to-pink-400" : "bg-gradient-to-r from-cyan-600 to-cyan-400"}`}
                    style={{ width: `${(range.count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-br from-black to-pink-950/30 rounded-lg border border-pink-900/30">
          <h3 className="text-cyan-400 font-mono mb-2">DISTRIBUTION INSIGHTS</h3>
          <p className="text-gray-300 text-sm">
            The majority of users fall in the 2,501-10,000 stars range, representing the active community members. Only
            a small percentage have reached the highest tier of 10,001+ stars, making them the elite contributors to the
            network.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

