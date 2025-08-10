import { NextResponse } from "next/server"

type PricePayload = {
  usd: number
  source: "coingecko"
  lastUpdated: number // ms epoch
}

let cache: PricePayload | null = null
const TTL_MS = 60 * 60 * 1000 // 1 hour

async function fetchFromCoinGecko(): Promise<PricePayload> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=succinct&vs_currencies=usd"
  const res = await fetch(url, {
    // Let upstream be cached; we still keep our own in-memory cache below.
    headers: { "accept": "application/json" },
    // In case the platform supports it, allow ISR-like caching at fetch level.
    next: { revalidate: 3600 },
  })
  if (!res.ok) {
    throw new Error(`CoinGecko error: ${res.status}`)
  }
  const data = await res.json()
  const price = Number(data?.succinct?.usd)
  if (!Number.isFinite(price)) {
    throw new Error("Invalid price from CoinGecko")
  }
  return { usd: price, source: "coingecko", lastUpdated: Date.now() }
}

export async function GET() {
  try {
    const now = Date.now()
    if (cache && now - cache.lastUpdated < TTL_MS) {
      return NextResponse.json(cache, {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
      })
    }
    const fresh = await fetchFromCoinGecko()
    cache = fresh
    return NextResponse.json(fresh, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (err) {
    // Fallback to stale cache if available
    if (cache) {
      return NextResponse.json(cache, {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=300",
          "X-Cache-Warn": "Using stale cached price due to fetch error",
        },
      })
    }
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 502 }
    )
  }
}
