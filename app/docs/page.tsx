"use client"

import { useEffect } from "react"
import { LoadingStats } from "@/components/LoadingStats"

export default function DocsPage() {
  useEffect(() => {
    window.location.href = "https://docs.succinct.xyz/"
  }, [])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingStats />
        <p className="text-pink-500 mt-4 font-mono">Redirecting to Succinct Documentation...</p>
      </div>
    </div>
  )
}

