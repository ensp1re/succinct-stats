"use client"

import { ReactElement, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProverSparkline } from "@/components/staking/ProverSparkline"
import { formatProveTokens, formatNumber, shortenAddress } from "@/lib/client-utils"
import { useProvePrice, formatUsdValue } from "@/hooks/use-prove-price"
import { Award, Users, Activity } from "lucide-react"
import Image from "next/image"

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

export function ProverCard({ data }: { data: ProverData }): ReactElement {
  const [series, setSeries] = useState<Array<{ x: string; y: number }>>([])
  const { price: provePrice } = useProvePrice()

  useEffect(() => {
    void (async () => {
      try {
        const r = await fetch(`/api/staking/prover-timeseries?address=${encodeURIComponent(data.prover)}`)
        const j = await r.json()
        const seriesData = (j.series as Array<{ date: string; total: string }> | undefined) || []
        setSeries(seriesData.map((d) => ({ x: d.date, y: Number(d.total) })))
      } catch {}
    })()
  }, [data.prover])



  const isTopThree = data.rank && data.rank <= 3

  return (
    <Card className={`border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 ${
      isTopThree ? "bg-gradient-to-br from-white to-pink-50/50 dark:from-black dark:to-pink-950/20" : "bg-white dark:bg-black"
    }`}>
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.logo_url ? (
              <Image
                src={data.logo_url}
                alt={data.name || "Prover"}
                width={40}
                height={40}
                className="rounded-full border-2 border-pink-300/50"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {data.name ? data.name[0].toUpperCase() : "P"}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="font-mono text-pink-500 text-base font-bold">
                {data.name || shortenAddress(data.prover)}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {shortenAddress(data.prover)}
              </p>
            </div>
          </div>
          {data.rank && (
            <Badge className={`${
              data.rank === 1 ? "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black" :
              data.rank === 2 ? "bg-gradient-to-r from-gray-400 to-gray-300 text-black" :
              data.rank === 3 ? "bg-gradient-to-r from-amber-700 to-amber-600 text-white" :
              "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}>
              <Award className="w-3 h-3 mr-1" />
              #{data.rank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mb-1">TOTAL STAKED</p>
            <p className="text-xl font-mono font-bold text-gray-800 dark:text-white">
              {formatProveTokens(data.totalStaked)}
            </p>
            {provePrice && (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                {formatUsdValue(data.totalStaked, provePrice)}
              </p>
            )}
          </div>

          {(data.proofs_won !== undefined || data.prover_gas || data.apr_percent !== undefined) && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {data.proofs_won !== undefined && data.proofs_won !== null && (
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
                  <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-mono mb-1">
                    <Award className="w-3 h-3 mr-1" />
                    PROOFS WON
                  </div>
                  <p className="font-mono font-bold text-gray-800 dark:text-white">
                    {data.proofs_won}
                  </p>
                </div>
              )}
              {data.prover_gas && (
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
                  <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-mono mb-1">
                    <Activity className="w-3 h-3 mr-1" />
                    GAS
                  </div>
                  <p className="font-mono font-bold text-gray-800 dark:text-white">
                    {data.prover_gas}
                  </p>
                </div>
              )}
              {data.apr_percent !== undefined && data.apr_percent !== null && (
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
                  <div className="text-cyan-600 dark:text-cyan-400 font-mono mb-1">APY</div>
                  <p className="font-mono font-bold text-gray-800 dark:text-white">
                    {data.apr_percent}%
                  </p>
                </div>
              )}
              {data.success_rate !== undefined && data.success_rate !== null && (
                <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-2 rounded border border-pink-300/30 dark:border-pink-900/30">
                  <div className="text-cyan-600 dark:text-cyan-400 font-mono mb-1">SUCCESS</div>
                  <p className="font-mono font-bold text-gray-800 dark:text-white">
                    {data.success_rate}%
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-mono mb-2">STAKING TREND</p>
            <ProverSparkline data={series} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}