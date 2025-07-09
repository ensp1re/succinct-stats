"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getNetworkStats } from "@/lib/csv-service"
import { ReactElement, useEffect, useState } from "react"

export function NetworkStats(): ReactElement {
  const [totalProvers, setTotalProvers] = useState<number>(23505)
  const [totalStars, setTotalStars] = useState<number>(1254789)
  const [totalCycles, setTotalCycles] = useState<number>(87654321098)
  const [totalProofs, setTotalProofs] = useState<number>(9876)

  const [animatedProvers, setAnimatedProvers] = useState<number>(0)
  const [animatedStars, setAnimatedStars] = useState<number>(0)
  const [animatedCycles, setAnimatedCycles] = useState<number>(0)
  const [animatedProofs, setAnimatedProofs] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getNetworkStats();
      setTotalProvers(res.totalProvers);
      setTotalStars(res.totalStars);
      setTotalCycles(res.totalCycles);
      setTotalProofs(res.totalProofs);
    };
    fetchData();
  }, [])

  useEffect(() => {
    const duration = 2000 // 2 seconds for the animation
    const steps = 50 // Number of steps in the animation
    const interval = duration / steps

    const proversStep = totalProvers / steps
    const starsStep = totalStars / steps
    const cyclesStep = totalCycles / steps
    const proofsStep = totalProofs / steps

    let currentStep = 0

    const animationInterval = setInterval(() => {
      currentStep++

      setAnimatedProvers(Math.min(Math.floor(proversStep * currentStep), totalProvers))
      setAnimatedStars(Math.min(Math.floor(starsStep * currentStep), totalStars))
      setAnimatedCycles(Math.min(Math.floor(cyclesStep * currentStep), totalCycles))
      setAnimatedProofs(Math.min(Math.floor(proofsStep * currentStep), totalProofs))

      if (currentStep >= steps) {
        clearInterval(animationInterval)
        setAnimatedProvers(totalProvers)
        setAnimatedStars(totalStars)
        setAnimatedCycles(totalCycles)
        setAnimatedProofs(totalProofs)
      }
    }, interval)

    return () => clearInterval(animationInterval)
  }, [totalProvers, totalStars, totalCycles, totalProofs])

  return (
    <Card className="bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
      <CardHeader className="border-b border-pink-300/30 dark:border-pink-900/30">
        <CardTitle className="text-xl font-mono text-pink-500">NETWORK STATS</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
            <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2">TOTAL PROVERS</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white font-mono">{animatedProvers.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
            <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2">TOTAL STARS</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white font-mono">{animatedStars?.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
            <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2">TOTAL CYCLES</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white font-mono">{animatedCycles.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 p-4 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
            <h3 className="text-cyan-600 dark:text-cyan-400 font-mono mb-2">TOTAL PROOFS</h3>
            <p className="text-2xl font-bold text-gray-800 dark:text-white font-mono">{animatedProofs.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 rounded-lg border border-pink-300/30 dark:border-pink-900/30">
          <p className="text-center text-pink-500 dark:text-pink-400 font-mono">
            Welcome to the Succinct Network. Help restore trust, earn stars, and secure humanity's future!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

