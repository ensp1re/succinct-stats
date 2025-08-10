"use client"

import { ReactElement } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Award } from "lucide-react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { shortenAddress, formatProveTokens } from "@/lib/client-utils"

export type StakerRow = {
  rank: number
  staker: string
  lastProver: string
  lastStakedAt: string
  lastTxHash: string
  totalStaked: string
}

type StakersTableProps = {
  rows: StakerRow[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading?: boolean
}

export function StakersTable({ 
  rows, 
  currentPage, 
  totalPages, 
  onPageChange,
  isLoading = false 
}: StakersTableProps): ReactElement {
  
  return (
    <div className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b border-pink-300/30 dark:border-pink-900/30 p-4">
        <h3 className="text-xl font-mono text-pink-500">STAKERS LEADERBOARD</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-pink-300/30 dark:border-pink-900/30">
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono">RANK</TableHead>
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono">STAKER</TableHead>
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono">PROVER</TableHead>
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono">STAKED AT</TableHead>
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono">TX</TableHead>
              <TableHead className="text-cyan-600 dark:text-cyan-400 font-mono text-right">TOTAL STAKED</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-pink-300/30 dark:border-pink-900/30">
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="w-8 h-8 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin mx-auto"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              rows.map((row, index) => {
                const globalRank = row.rank
                const isTopThree = globalRank <= 3

                return (
                  <TableRow
                    key={`${row.staker}-${row.lastTxHash}`}
                    className={`border-pink-300/30 dark:border-pink-900/30 ${
                      isTopThree ? "bg-gradient-to-r from-white to-pink-50/50 dark:from-black dark:to-pink-950/20" : ""
                    }`}
                  >
                    <TableCell className="font-mono">
                      {isTopThree ? (
                        <Badge className={`${
                          globalRank === 1 ? "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black" :
                          globalRank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-300 text-black" :
                          "bg-gradient-to-r from-amber-700 to-amber-600 text-white"
                        }`}>
                          <Award className="w-3 h-3 mr-1" />
                          {row.rank}
                        </Badge>
                      ) : (
                        <span className="text-gray-800 dark:text-white">#{row.rank}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {shortenAddress(row.staker)}
                    </TableCell>
                    <TableCell className="font-mono text-gray-700 dark:text-gray-300">
                      {shortenAddress(row.lastProver)}
                    </TableCell>
                    <TableCell className="font-mono text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(row.lastStakedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      <Link
                        href={`https://etherscan.io/tx/${row.lastTxHash}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        {shortenAddress(row.lastTxHash)} 
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-right font-bold text-gray-800 dark:text-white">
                      {formatProveTokens(row.totalStaked)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="border-t border-pink-300/30 dark:border-pink-900/30 p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-gray-700 dark:text-gray-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-gray-700 dark:text-gray-200"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}