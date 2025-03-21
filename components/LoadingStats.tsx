export function LoadingStats() {
  return (
    <div className="w-full h-64 rounded-lg border border-pink-900/50 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-t-2 border-pink-500 border-r-2 border-pink-500/50 rounded-full animate-spin mb-4"></div>
        <p className="text-pink-500 font-mono text-sm">LOADING DATA...</p>
      </div>
    </div>
  )
}

