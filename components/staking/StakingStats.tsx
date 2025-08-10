"use client"

import { ReactElement, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Coins, TrendingUp, Award, Loader2 } from "lucide-react"
import { ProverCard } from "@/components/staking/ProverCard"
import { StakersTable, StakerRow } from "@/components/staking/StakersTable"
import { DistributionPie } from "@/components/staking/DistributionPie"
import { StakingChart } from "@/components/staking/StakingChart"
import { formatNumber, formatProveTokens } from "@/lib/client-utils"
import { useProvePrice, formatUsdValue } from "@/hooks/use-prove-price"

import { ErrorState, TableErrorState, ChartErrorState } from "@/components/staking/ErrorStates"

// Simple loading component with icon
const LoadingState = ({ className = "" }: { className?: string }) => (
  <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
    <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Loading...</p>
  </div>
)

type Summary = { 
  uniqueStakers: number
  totalStaked: string 
}

type ProverData = {
  prover: string
  totalStaked: string
  rank?: number
  id?: number
  name?: string
  logo_url?: string
  proofs_won?: number | string
  prover_gas?: string
  apr_percent?: number | string | null
  success_rate?: number | string | null
}

type ChartData = {
  date: string
  total: string
}

export function StakingStats(): ReactElement {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [provers, setProvers] = useState<ProverData[]>([])
  const [stakers, setStakers] = useState<StakerRow[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [query, setQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const { price: provePrice } = useProvePrice()
  
  // Loading states
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true)
  const [isLoadingProvers, setIsLoadingProvers] = useState<boolean>(true)
  const [isLoadingStakers, setIsLoadingStakers] = useState<boolean>(false)
  const [isLoadingChart, setIsLoadingChart] = useState<boolean>(false)
  
  // Error states
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [proversError, setProversError] = useState<string | null>(null)
  const [stakersError, setStakersError] = useState<string | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)

  // Animated counters
  const [animatedStakers, setAnimatedStakers] = useState<number>(0)
  const [animatedTotalStaked, setAnimatedTotalStaked] = useState<string>("0")

  // Load initial data
  const loadInitialData = async () => {
    setIsLoadingSummary(true)
    setIsLoadingProvers(true)
    setSummaryError(null)
    setProversError(null)
    
    try {
      const [summaryRes, proversRes] = await Promise.all([
        fetch("/api/staking/summary"),
        fetch("/api/staking/provers"),
      ])
      
      if (!summaryRes.ok) throw new Error("Failed to load summary data")
      if (!proversRes.ok) throw new Error("Failed to load provers data")
      
      const [summaryData, proversData] = await Promise.all([
        summaryRes.json(),
        proversRes.json(),
      ])
      
      if (summaryData.error) throw new Error(summaryData.error)
      if (proversData.error) throw new Error(proversData.error)
      
      setSummary(summaryData)
      setProvers(proversData.provers)
    } catch (error: any) {
      console.error("Error loading initial data:", error)
      if (error.message.includes("summary")) {
        setSummaryError(error.message)
      }
      if (error.message.includes("provers")) {
        setProversError(error.message)
      }
      if (!error.message.includes("summary") && !error.message.includes("provers")) {
        setSummaryError("Failed to connect to database")
        setProversError("Failed to connect to database")
      }
    } finally {
      setIsLoadingSummary(false)
      setIsLoadingProvers(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Load chart data when period changes
  const loadChartData = async (newPeriod: "day" | "week" | "month") => {
    setIsLoadingChart(true)
    setChartError(null)
    
    try {
      const res = await fetch(`/api/staking/timeseries?period=${newPeriod}`)
      if (!res.ok) throw new Error("Failed to load chart data")
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setChartData(data.series)
    } catch (error: any) {
      console.error("Error loading chart data:", error)
      setChartError(error.message)
    } finally {
      setIsLoadingChart(false)
    }
  }

  useEffect(() => {
    loadChartData(period)
  }, [period])

  // Load stakers data when page or query changes
  const loadStakersData = async () => {
    setIsLoadingStakers(true)
    setStakersError(null)
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })
      if (query) params.append("q", query)
      
      const res = await fetch(`/api/staking/stakers?${params}`)
      if (!res.ok) throw new Error("Failed to load stakers data")
      
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      
      setStakers(data.stakers)
      setTotalPages(Math.ceil(data.total / 10))
    } catch (error: any) {
      console.error("Error loading stakers:", error)
      setStakersError(error.message)
    } finally {
      setIsLoadingStakers(false)
    }
  }

  useEffect(() => {
    loadStakersData()
  }, [currentPage, query])

  // Animate counters
  useEffect(() => {
    if (!summary) return
    
    const duration = 2000
    const steps = 50
    const interval = duration / steps
    
    const stakersStep = summary.uniqueStakers / steps
    const totalStakedNum = parseFloat(summary.totalStaked)
    const totalStakedStep = totalStakedNum / steps
    
    let currentStep = 0
    
    const animationInterval = setInterval(() => {
      currentStep++
      
      setAnimatedStakers(Math.min(Math.floor(stakersStep * currentStep), summary.uniqueStakers))
      setAnimatedTotalStaked((Math.min(totalStakedStep * currentStep, totalStakedNum)).toFixed(6))
      
      if (currentStep >= steps) {
        clearInterval(animationInterval)
        setAnimatedStakers(summary.uniqueStakers)
        setAnimatedTotalStaked(summary.totalStaked)
      }
    }, interval)
    
    return () => clearInterval(animationInterval)
  }, [summary])

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoadingSummary ? (
          <div className="col-span-full">
            <LoadingState className="min-h-[120px]" />
          </div>
        ) : summaryError ? (
          <div className="md:col-span-3">
            <ErrorState 
              title="Database Connection Failed"
              message={summaryError}
              onRetry={loadInitialData}
              type="database"
            />
          </div>
        ) : (
          <>
            <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
              <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  UNIQUE STAKERS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                  <div className="text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {formatNumber(animatedStakers)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total participants</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
              <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
                  <Coins className="w-5 h-5 mr-2" />
                  TOTAL STAKED
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                  <div className="text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {formatProveTokens(animatedTotalStaked)}
                  </div>
                  {provePrice && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-1">
                      {formatUsdValue(animatedTotalStaked, provePrice)}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Across all provers</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
              <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
                <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  TOP PROVERS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
                  <div className="text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                    {provers.filter(p => {
                      const successRate = typeof p.success_rate === 'number' 
                        ? p.success_rate 
                        : parseFloat(String(p.success_rate || 0))
                      return successRate > 0
                    }).length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active provers</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Chart */}
      {isLoadingChart ? (
        <Card className="border-pink-300/30 dark:border-pink-900/30">
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400 font-mono flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              STAKING ACTIVITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingState className="min-h-[300px]" />
          </CardContent>
        </Card>
      ) : chartError ? (
        <ChartErrorState onRetry={() => loadChartData(period)} />
      ) : (
        <StakingChart 
          data={chartData} 
          period={period} 
          onPeriodChange={(newPeriod) => {
            setPeriod(newPeriod)
            loadChartData(newPeriod)
          }}
          isLoading={isLoadingChart}
        />
      )}

      {/* Stakers Table and Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Input
            placeholder="Search by staker or prover address..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="font-mono border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500 dark:focus:border-pink-400"
          />
          {isLoadingStakers ? (
            <Card className="border-pink-300/30 dark:border-pink-900/30">
              <CardHeader>
                <CardTitle className="text-cyan-600 dark:text-cyan-400 font-mono flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  TOP STAKERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingState className="min-h-[400px]" />
              </CardContent>
            </Card>
          ) : stakersError ? (
            <TableErrorState message={stakersError} onRetry={loadStakersData} />
          ) : (
            <StakersTable 
              rows={stakers}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              isLoading={isLoadingStakers}
            />
          )}
        </div>
        <div className="lg:col-span-1">
          {isLoadingProvers ? (
            <Card className="border-pink-300/30 dark:border-pink-900/30">
              <CardHeader>
                <CardTitle className="text-cyan-600 dark:text-cyan-400 font-mono">
                  DISTRIBUTION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoadingState className="min-h-[300px]" />
              </CardContent>
            </Card>
          ) : proversError ? (
            <ErrorState 
              title="Provers Data Unavailable"
              message={proversError}
              onRetry={loadInitialData}
              type="database"
            />
          ) : (
            <DistributionPie data={provers} />
          )}
        </div>
      </div>

      {/* Top Prover Cards */}
      <div>
        <h3 className="text-2xl font-mono font-bold text-pink-500 mb-6">ALL PROVERS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingProvers ? (
            <div className="col-span-full">
              <LoadingState className="min-h-[200px]" />
            </div>
          ) : proversError ? (
            <div className="md:col-span-2 lg:col-span-3">
              <ErrorState 
                title="Provers Data Unavailable"
                message={proversError}
                onRetry={loadInitialData}
                type="database"
              />
            </div>
          ) : (
            provers
              .filter(p => {
                const successRate = typeof p.success_rate === 'number' 
                  ? p.success_rate 
                  : parseFloat(String(p.success_rate || 0))
                return successRate > 0
              })
              .map((prover, index) => (
                <ProverCard 
                  key={`${prover.id || 'prover'}-${prover.prover}-${index}`} 
                  data={{ ...prover, rank: index + 1 }} 
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}