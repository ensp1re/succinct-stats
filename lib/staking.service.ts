import { query } from "@/lib/db"
import { ProveTransactionRow, ProverAggregate, StakerAggregate, StakingDataRow } from "@/lib/types"

// Convert on-chain numeric string (wei-like) to decimal string in PROVE units (18 decimals)
export function toProveUnits(raw: string | null): string {
  if (!raw) return "0"
  // Use BigInt for precision, assume 18 decimals
  try {
    const numerator = BigInt(raw)
    const decimalsNum = 18
    let base = BigInt(1)
    for (let i = 0; i < decimalsNum; i++) {
      base = base * BigInt(10)
    }
    const integerPart = numerator / base
    const fractionalPart = numerator % base
    const fractionalStr = fractionalPart
      .toString()
      .padStart(decimalsNum, "0")
      .replace(/0+$/, "")
    return fractionalStr.length > 0 ? `${integerPart.toString()}.${fractionalStr}` : integerPart.toString()
  } catch {
    return "0"
  }
}

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

export async function getProverAggregates(): Promise<ProverAggregate[]> {
  const sql = `
    SELECT prover, SUM(COALESCE(prove::numeric, 0)) AS total_staked
    FROM prove_transactions
    GROUP BY prover
    ORDER BY total_staked DESC
    LIMIT 50;
  `
  const { rows } = await query<{ prover: string; total_staked: string }>(sql)
  return rows.map((r) => ({ prover: r.prover, totalStaked: toProveUnits(r.total_staked) }))
}

export async function getStakerAggregates(search?: string, page = 1, limit = 10): Promise<{ stakers: StakerAggregate[]; total: number }> {
  const params: unknown[] = []
  const where: string[] = []
  let paramIndex = 1
  
  if (search) {
    params.push(`%${search}%`)
    params.push(`%${search}%`)
    where.push(`(staker ILIKE $${paramIndex} OR prover ILIKE $${paramIndex + 1})`)
    paramIndex += 2
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const offset = (page - 1) * limit

  params.push(limit, offset)

  const sql = `
    WITH last_tx AS (
      SELECT DISTINCT ON (staker)
        staker,
        prover,
        evt_tx_hash,
        evt_block_time
      FROM prove_transactions
      ORDER BY staker, evt_block_time DESC
    ),
    totals AS (
      SELECT staker, SUM(COALESCE(prove::numeric, 0)) AS total_staked
      FROM prove_transactions
      GROUP BY staker
    ),
    all_ranked AS (
      SELECT t.staker, to_char(l.evt_block_time::timestamptz, 'YYYY-MM-DD"T"HH24:MI:SSZ') AS last_staked_at,
             l.evt_tx_hash, l.prover, t.total_staked,
             ROW_NUMBER() OVER (ORDER BY t.total_staked DESC) as rank
      FROM totals t
      LEFT JOIN last_tx l USING (staker)
    ),
    filtered AS (
      SELECT r.*
      FROM all_ranked r
      ${whereSql ? whereSql.replace('staker ILIKE', 'r.staker ILIKE').replace('prover ILIKE', 'r.prover ILIKE') : ''}
      ORDER BY r.total_staked DESC
    ),
    total_count AS (
      SELECT COUNT(*) as total FROM filtered
    )
    SELECT r.*, tc.total
    FROM filtered r, total_count tc
    ORDER BY r.total_staked DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `

  const { rows } = await query<{ 
    staker: string; 
    last_staked_at: string; 
    evt_tx_hash: string; 
    prover: string; 
    total_staked: string;
    rank: string;
    total: string;
  }>(sql, params)
  
  const total = rows.length > 0 ? parseInt(rows[0].total) : 0
  const stakers = rows.map((r) => ({
    rank: parseInt(r.rank),
    staker: r.staker,
    totalStaked: toProveUnits(r.total_staked),
    lastTxHash: r.evt_tx_hash,
    lastStakedAt: r.last_staked_at,
    lastProver: r.prover,
  }))

  return { stakers, total }
}

export async function getTotalsSummary(): Promise<{ uniqueStakers: number; totalStaked: string }>{
  const sql = `
    SELECT COUNT(DISTINCT staker) AS unique_stakers,
           SUM(COALESCE(prove::numeric, 0)) AS total_staked
    FROM prove_transactions;
  `
  const { rows } = await query<{ unique_stakers: string; total_staked: string }>(sql)
  const uniqueStakers = Number(rows[0]?.unique_stakers || 0)
  const totalStaked = toProveUnits(rows[0]?.total_staked || "0")
  return { uniqueStakers, totalStaked }
}

export async function getStakingTimeseries(period: "day" | "week" | "month" = "day"): Promise<Array<{ date: string; total: string }>> {
  const truncPeriod = period === "week" ? "week" : period === "month" ? "month" : "day"
  
  const sql = `
    SELECT date_trunc('${truncPeriod}', evt_block_time::timestamptz) AS d,
           SUM(COALESCE(prove::numeric, 0)) AS daily_amount
    FROM prove_transactions
    GROUP BY 1
    ORDER BY 1
  `
  const { rows } = await query<{ d: string; daily_amount: string }>(sql)
  let cumulative = BigInt(0)
  return rows.map((r) => {
    const val = BigInt(r.daily_amount || "0")
    cumulative += val
    return { date: r.d, total: toProveUnits(cumulative.toString()) }
  })
}

export async function getProverTimeseries(prover: string): Promise<Array<{ date: string; total: string }>> {
  const sql = `
    SELECT date_trunc('day', evt_block_time::timestamptz) AS d,
           SUM(COALESCE(prove::numeric, 0)) AS daily_amount
    FROM prove_transactions
    WHERE prover = $1
    GROUP BY 1
    ORDER BY 1
  `
  const { rows } = await query<{ d: string; daily_amount: string }>(sql, [prover])
  let cumulative = BigInt(0)
  return rows.map((r) => {
    const val = BigInt(r.daily_amount || "0")
    cumulative += val
    return { date: r.d, total: toProveUnits(cumulative.toString()) }
  })
}

// Get staking data (prover metadata) - assumes table exists
export async function getStakingData(): Promise<StakingDataRow[]> {
  const sql = `
   SELECT id, "name", address, logo_url, prover_gas, proofs_won, staked_prove, rewards_prove, apr_percent, success_rate, last_updated, created_at
FROM staking_data;
  `
  try {
    const { rows } = await query<StakingDataRow>(sql)
    return rows
  } catch (error) {
    console.warn("staking_data table not found, returning empty array:", error)
    return []
  }
}

// Get enhanced prover aggregates with metadata from staking_data
export async function getEnhancedProverAggregates(): Promise<Array<ProverAggregate & Partial<StakingDataRow>>> {
  const stakingData = await getStakingData()
  
  console.log("Staking data loaded:", stakingData.length)
  
  // If we have staking_data, use that as the primary source
  if (stakingData.length > 0) {
    // Get all transaction data first
    const sql = `
      SELECT prover, SUM(COALESCE(prove::numeric, 0)) AS total_staked
      FROM prove_transactions
      GROUP BY prover
      ORDER BY total_staked DESC;
    `
    
    const { rows } = await query<{ prover: string; total_staked: string }>(sql)
    
    // Match transaction data with staking_data by first 5 characters
    // Each transaction should only appear once, so iterate through transactions
    const proversMap = new Map<string, ProverAggregate & Partial<StakingDataRow>>()
    
    rows.forEach((txData, index) => {
      if (parseFloat(toProveUnits(txData.total_staked)) > 0) {
        const proverPrefix = txData.prover.slice(0, 5).toLowerCase()
        
        // Find the best matching staking_data entry for this transaction
        const stakingEntry = stakingData.find(s => 
          s.address && s.address.slice(0, 5).toLowerCase() === proverPrefix
        )
        
        // Use the actual transaction prover address as the unique key
        proversMap.set(txData.prover, {
          prover: txData.prover, // Use actual prover address from transactions
          totalStaked: toProveUnits(txData.total_staked),
          rank: index + 1,
          id: stakingEntry?.id,
          name: stakingEntry?.name || `${txData.prover.slice(0, 6)}...${txData.prover.slice(-4)}`,
          address: stakingEntry?.address || txData.prover,
          logo_url: stakingEntry?.logo_url,
          prover_gas: stakingEntry?.prover_gas,
          proofs_won: stakingEntry?.proofs_won,
          staked_prove: stakingEntry?.staked_prove,
          rewards_prove: stakingEntry?.rewards_prove,
          apr_percent: stakingEntry?.apr_percent,
          success_rate: stakingEntry?.success_rate,
          last_updated: stakingEntry?.last_updated,
          created_at: stakingEntry?.created_at,
        })
      }
    })
    
    // Convert Map values to array and sort by total staked
    return Array.from(proversMap.values())
      .sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked))
  }
  
  // Fallback to regular aggregates if no staking_data
  const aggregates = await getProverAggregates()
  return aggregates.map((agg) => {
    const meta = stakingData.find((s) => s.address.toLowerCase() === agg.prover.toLowerCase())
    return {
      ...agg,
      ...meta,
    }
  })
}


