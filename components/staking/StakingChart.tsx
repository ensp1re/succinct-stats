"use client"

import { ReactElement, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Calendar, TrendingUp, Loader2 } from "lucide-react"

type ChartData = {
  date: string
  total: string
}

type StakingChartProps = {
  data: ChartData[]
  period: "day" | "week" | "month"
  onPeriodChange: (period: "day" | "week" | "month") => void
  isLoading?: boolean
  error?: string | null
}

export function StakingChart({ data, period, onPeriodChange, isLoading }: StakingChartProps): ReactElement {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    })
    
    return () => observer.disconnect()
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (period === "day") return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    if (period === "week") return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  }

  const formatValue = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
    return value.toFixed(2)
  }

  // Handle data and ensure minimum points for proper chart display
  const chartData = data.length > 0 
    ? extendDataForChart(data.map(d => ({
        date: formatDate(d.date),
        value: parseFloat(d.total),
        fullDate: d.date
      })), period)
    : generateEmptyData(period)

  // Extend data to ensure minimum points for proper chart display
  function extendDataForChart(mappedData: any[], period: string) {
    if (mappedData.length === 0) return generateEmptyData(period)
    
    const minPoints = period === 'day' ? 7 : period === 'week' ? 4 : 6
    
    if (mappedData.length >= minPoints) {
      return mappedData
    }
    
    // If we have fewer points than needed, extend backwards with zeros
    const sortedData = mappedData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    const firstDate = new Date(sortedData[0].fullDate)
    const extendedData = [...sortedData]
    
    // Add points before the first data point
    for (let i = mappedData.length; i < minPoints; i++) {
      const newDate = new Date(firstDate)
      
      if (period === 'day') {
        newDate.setDate(newDate.getDate() - (i - mappedData.length + 1))
      } else if (period === 'week') {
        newDate.setDate(newDate.getDate() - (i - mappedData.length + 1) * 7)
      } else { // month
        newDate.setMonth(newDate.getMonth() - (i - mappedData.length + 1))
      }
      
      extendedData.unshift({
        date: formatDate(newDate.toISOString()),
        value: 0,
        fullDate: newDate.toISOString()
      })
    }
    
    return extendedData.sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
  }

  // Generate mock data with zeros for periods with no activity
  function generateEmptyData(period: string) {
    const now = new Date()
    const points = []
    
    if (period === 'day') {
      // Last 7 days - all zeros
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        points.push({
          date: formatDate(date.toISOString()),
          value: 0,
          fullDate: date.toISOString()
        })
      }
    } else if (period === 'week') {
      // Last 4 weeks - all zeros
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - (i * 7))
        points.push({
          date: formatDate(date.toISOString()),
          value: 0,
          fullDate: date.toISOString()
        })
      }
    } else {
      // Last 6 months - all zeros
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        points.push({
          date: formatDate(date.toISOString()),
          value: 0,
          fullDate: date.toISOString()
        })
      }
    }
    
    return points
  }

  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-lg sm:text-xl font-mono text-pink-500 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            STAKING ACTIVITY
          </CardTitle>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button
              variant={period === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange("day")}
              className={`text-xs sm:text-sm ${period === "day" ? 
                "bg-pink-500 hover:bg-pink-600 text-white" : 
                "border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
              }`}
            >
              Days
            </Button>
            <Button
              variant={period === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange("week")}
              className={`text-xs sm:text-sm ${period === "week" ? 
                "bg-pink-500 hover:bg-pink-600 text-white" : 
                "border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
              }`}
            >
              Weeks
            </Button>
            <Button
              variant={period === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange("month")}
              className={`text-xs sm:text-sm ${period === "month" ? 
                "bg-pink-500 hover:bg-pink-600 text-white" : 
                "border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
              }`}
            >
              Months
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="h-[250px] sm:h-[300px] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">Loading chart...</p>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }}
                  tickFormatter={formatValue}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    color: isDark ? '#f3f4f6' : '#374151'
                  }}
                  formatter={(value: number) => [`${formatValue(value)} PROVE`, 'Total Staked']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#ec4899' }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4 p-3 sm:p-4 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <div className="flex items-center text-cyan-600 dark:text-cyan-400 font-mono mb-2 text-xs sm:text-sm">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            ACTIVITY INSIGHTS
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
            {data.length > 0 
              ? `Total staked PROVE tokens over time (${period}ly view). Shows cumulative staking growth and network adoption.` 
              : `No staking activity data available for this ${period} period. Chart shows zero baseline levels.`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
