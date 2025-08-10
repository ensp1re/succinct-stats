"use client"

import { ReactElement } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Database, Network } from "lucide-react"

type ErrorStateProps = {
  title: string
  message: string
  onRetry?: () => void
  type?: "network" | "database" | "general"
}

export function ErrorState({ title, message, onRetry, type = "general" }: ErrorStateProps): ReactElement {
  const getIcon = () => {
    switch (type) {
      case "network": return <Network className="h-8 w-8 text-pink-500" />
      case "database": return <Database className="h-8 w-8 text-pink-500" />
      default: return <AlertCircle className="h-8 w-8 text-pink-500" />
    }
  }

  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardContent className="pt-8">
        <div className="text-center p-6 bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-lg max-w-md mx-auto">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-pink-600 dark:text-pink-400 font-mono font-bold text-lg mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {message}
          </p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TableErrorState({ message, onRetry }: { message: string; onRetry?: () => void }): ReactElement {
  return (
    <div className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10 rounded-lg overflow-hidden">
      <div className="border-b border-pink-300/30 dark:border-pink-900/30 p-4">
        <h3 className="text-xl font-mono text-pink-500">STAKERS LEADERBOARD</h3>
      </div>
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-pink-500 mx-auto mb-4" />
        <h4 className="text-pink-600 dark:text-pink-400 font-mono font-bold mb-2">
          Failed to Load Data
        </h4>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {message}
        </p>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
            onClick={onRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}

export function ChartErrorState({ onRetry }: { onRetry?: () => void }): ReactElement {
  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <CardTitle className="text-xl font-mono text-pink-500 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          CHART UNAVAILABLE
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center p-6 bg-pink-50 dark:bg-pink-950/20 border border-pink-300/50 dark:border-pink-900/50 rounded-lg max-w-md">
            <Network className="h-8 w-8 text-pink-500 mx-auto mb-2" />
            <h3 className="text-pink-600 dark:text-pink-400 font-medium mb-2">Data Unavailable</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Unable to load chart data. Please check your connection and try again.
            </p>
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                className="border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
