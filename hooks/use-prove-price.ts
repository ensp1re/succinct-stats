"use client"

import { useState, useEffect } from "react"

type PriceData = {
  usd: number
  source: "coingecko"
  lastUpdated: number
}

export function useProvePrice() {
  const [price, setPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPrice() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/price')
        if (!response.ok) {
          throw new Error('Failed to fetch price')
        }
        
        const data: PriceData = await response.json()
        setPrice(data.usd)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        console.error('Error fetching PROVE price:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrice()
    
    // Refresh price every hour
    const interval = setInterval(fetchPrice, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { price, isLoading, error }
}

export function formatUsdValue(proveAmount: string | number, priceUsd: number | null): string {
  if (!priceUsd || !proveAmount) return ""
  
  const amount = typeof proveAmount === 'string' ? parseFloat(proveAmount) : proveAmount
  if (isNaN(amount)) return ""
  
  const usdValue = amount * priceUsd
  
  if (usdValue >= 1000000) {
    return `≈ $${(usdValue / 1000000).toFixed(1)}M`
  } else if (usdValue >= 1000) {
    return `≈ $${(usdValue / 1000).toFixed(1)}K`
  } else if (usdValue >= 1) {
    return `≈ $${usdValue.toFixed(2)}`
  } else {
    return `≈ $${usdValue.toFixed(4)}`
  }
}
