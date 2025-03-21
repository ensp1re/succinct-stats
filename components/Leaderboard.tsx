"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Award, Zap, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getEntriesByPage } from "@/lib/csv-service"

interface LeaderboardEntry {
  rank: string
  name: string
  invitedBy: string
  proofs: string
  cycles: string
  stars: string
}

export function Leaderboard() {
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [entriesPerPage] = useState<number>(5)
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [totalPages, setTotalPages] = useState<number>(0)

  useEffect(() => {
    const fetchData = async (retries = 3) => {
      setIsLoading(true)
      try {
        const res = await getEntriesByPage(currentPage, entriesPerPage)
        setData(res.data)
        setTotalPages(Math.ceil(res.total / entriesPerPage))
      } catch (error) {
        if (retries > 0) {
          console.warn(`Retrying... (${3 - retries + 1})`)
          fetchData(retries - 1)
        } else {
          console.error("Error fetching leaderboard data:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentPage])

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  return (
    <Card className="bg-black border border-pink-900/50 shadow-lg shadow-pink-500/10">
      <CardHeader className="border-b border-pink-900/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-mono text-pink-500">LEADERBOARD</CardTitle>

        </div>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center py-10 text-pink-500">
            <Loader2 className="animate-spin w-8 h-8 mb-2" />
            Loading leaderboard...
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-mono">No data found.</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="border-pink-900/30">
                  <TableHead className="text-cyan-400 font-mono">RANK</TableHead>
                  <TableHead className="text-cyan-400 font-mono">NAME</TableHead>
                  <TableHead className="text-cyan-400 font-mono">INVITED BY</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-right">PROOFS</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-right">CYCLES</TableHead>
                  <TableHead className="text-cyan-400 font-mono text-right">STARS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((entry, index) => (
                  <TableRow
                    key={index}
                    className={`border-pink-900/30 ${index < 3 ? "bg-gradient-to-r from-black to-pink-950/20" : ""}`}
                  >
                    <TableCell className="font-mono">
                      {index === 0 && currentPage === 1 ? (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-300 text-black">
                          <Award className="w-3 h-3 mr-1" />
                          {entry.rank}
                        </Badge>
                      ) : index === 1 && currentPage === 1 ? (
                        <Badge className="bg-gradient-to-r from-gray-400 to-gray-300 text-black">
                          <Award className="w-3 h-3 mr-1" />
                          {entry.rank}
                        </Badge>
                      ) : index === 2 && currentPage === 1 ? (
                        <Badge className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          {entry.rank}
                        </Badge>
                      ) : (
                        <span>{entry.rank}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{entry.name}</TableCell>
                    <TableCell className="font-mono text-gray-400">{entry.invitedBy}</TableCell>
                    <TableCell className="font-mono text-right">{entry.proofs}</TableCell>
                    <TableCell className="font-mono text-right">{entry.cycles}</TableCell>
                    <TableCell className="font-mono text-right flex justify-end items-center">
                      <Star className="w-4 h-4 mr-1 text-pink-500" />
                      {entry.stars}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-400 font-mono">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-pink-900/50 hover:bg-pink-950/30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-mono">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-pink-900/50 hover:bg-pink-950/30"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 font-mono text-center">
              <Zap className="inline-block w-3 h-3 mr-1" />
              Stats are updated weekly
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
