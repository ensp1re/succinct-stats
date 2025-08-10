export type DurationPreset = "day" | "month" | "year" | "custom"

export function daysForPreset(preset: DurationPreset): number {
  switch (preset) {
    case "day":
      return 1
    case "month":
      return 30
    case "year":
      return 365
    case "custom":
    default:
      return 0
  }
}

export function calcBaseRewardsPROVE(stake: number, aprPercent: number, days: number): number {
  const apr = safe(stake) * (safe(aprPercent) / 100)
  return (apr / 365) * safe(days)
}

export function calcAirdropTokenAmount(stake: number, airdropAprPercent: number, days: number): number {
  // Airdrop APR is treated as percent yield relative to stake per year.
  return safe(stake) * (safe(airdropAprPercent) / 100) * (safe(days) / 365)
}

export function toUSD(tokens: number, tokenPriceUsd: number): number {
  return safe(tokens) * safe(tokenPriceUsd)
}

export function toUSDFromPROVE(tokens: number, provePrice: number | undefined): number | undefined {
  if (!provePrice || !isFinite(provePrice)) return undefined
  return safe(tokens) * provePrice
}

// New: Compute implied APR (%) from airdrop params and PROVE price.
// Formula: impliedAPR% = airdropPercent% * (airdropTokenPrice / provePrice)
export function impliedAprFromAirdrop(
  airdropPercent: number,
  airdropTokenPriceUsd: number,
  _provePriceUsd?: number
): number {
  // Normalize to your example:
  // 0.05% (0.0005 fraction) at $5 -> 1000% APR
  // impliedAPR% = 1000 × (percentFraction / 0.0005) × (tokenPrice / 5)
  const percentFraction = (Number.isFinite(airdropPercent) ? airdropPercent : 0) / 100
  const baselineFraction = 0.0005
  const baselinePrice = 5
  const price = Number.isFinite(airdropTokenPriceUsd) ? airdropTokenPriceUsd : 0
  const apr =
    1000 * (percentFraction / baselineFraction) * (price / baselinePrice)
  return Number.isFinite(apr) ? apr : 0
}

export function formatNum(n: number, max = 2) {
  if (!isFinite(n)) return "0"
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: max }).format(n)
}

function safe(n: number) {
  return Number.isFinite(n) ? n : 0
}
