// Client-safe utility functions (no server dependencies)

// Format large numbers with K, M, B suffixes
export function formatNumber(num: number | string): string {
  const n = typeof num === "string" ? parseFloat(num) : num
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

// Format PROVE tokens with rounding
export function formatProveTokens(amount: string | number): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M PROVE`
  if (n >= 1e3) return `${(n / 1e3).toFixed(3)}K PROVE`
  return `${n.toFixed(6)} PROVE`
}

// Shorten addresses
export function shortenAddress(addr: string): string {
  if (!addr || addr.length <= 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
