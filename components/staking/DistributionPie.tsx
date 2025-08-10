"use client"

import { ReactElement } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieChartIcon } from "lucide-react"
import { shortenAddress } from "@/lib/client-utils"
import { useProvePrice, formatUsdValue } from "@/hooks/use-prove-price"

const COLORS = ["#fe11c5", "#22d3ee", "#e610b0", "#06b6d4", "#c20e95", "#0891b2", "#9f0c7a", "#16a085", "#831065", "#1abc9c"]

type DistributionData = {
  name: string
  value: number
  percentage: number
}

type DistributionPieProps = {
  data: Array<{ name?: string; prover: string; totalStaked: string }>
}

export function DistributionPie({ data }: DistributionPieProps): ReactElement {
  const { price: provePrice } = useProvePrice()
  // Calculate distribution with "Others" for remaining provers (top 9 + others)
  const topProvers = data.slice(0, 9)
  const othersValue = data.slice(9).reduce((sum, item) => sum + parseFloat(item.totalStaked), 0)
  
  const total = data.reduce((sum, item) => sum + parseFloat(item.totalStaked), 0)
  
  const pieData: DistributionData[] = [
    ...topProvers.map(item => ({
      name: item.name ? 
        (item.name.length > 12 ? `${item.name.slice(0, 9)}...` : item.name) : 
        shortenAddress(item.prover),
      value: parseFloat(item.totalStaked),
      percentage: (parseFloat(item.totalStaked) / total) * 100
    })),
    ...(othersValue > 0 ? [{
      name: "Others",
      value: othersValue,
      percentage: (othersValue / total) * 100
    }] : [])
  ]

  const formatValue = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(2)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-900 border border-pink-300/50 dark:border-pink-900/50 rounded-lg p-3 shadow-lg">
          <p className="font-mono text-sm text-gray-800 dark:text-white">{data.name}</p>
          <p className="font-mono text-xs text-cyan-600 dark:text-cyan-400">
            {formatValue(data.value)} PROVE ({data.percentage.toFixed(1)}%)
          </p>
          {provePrice && (
            <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatUsdValue(data.value, provePrice)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
          <PieChartIcon className="w-5 h-5 mr-2" />
          STAKING DISTRIBUTION
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}
                formatter={(value, entry) => (
                  <span style={{ color: 'var(--foreground)' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <h4 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2">DISTRIBUTION INSIGHTS</h4>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            Visualization of staking distribution across top provers. The chart shows how total staked PROVE tokens 
            are allocated, helping identify the most trusted validators in the network.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}