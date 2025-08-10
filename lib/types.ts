export interface LeaderboardEntry {
  rank: string;
  avatar: string;
  name: string;
  invitedBy: string;
  proofs: string;
  cycles: string;
  stars: string;
  topPercent?: string;
}

export interface UserData {
  stars: number;
  proofs: number;
  cycles: number;
}

export interface NetworkData {
  totalProvers: number;
  totalStars: number;
  totalCycles: number;
  totalProofs: number;
}

export interface ProveTransactionRow {
  id: string
  staker: string
  prover: string
  st_prove: string | null // crypto numeric string
  prove: string | null
  i_prove: string | null
  evt_tx_to: string | null
  evt_tx_index: number | null
  evt_tx_hash: string
  evt_tx_from: string | null
  evt_index: number | null
  evt_block_time: string // ISO or timestamp
  evt_block_number: string | number
  evt_block_date: string | null
  created_at: string
  updated_at: string | null
  contract_address: string | null
}

export interface ProverAggregate {
  prover: string
  totalStaked: string // decimal string in human units
  rank?: number
}

export interface StakerAggregate {
  rank: number
  staker: string
  totalStaked: string // decimal string in human units
  lastTxHash: string
  lastStakedAt: string
  lastProver: string
}

export interface StakingDataRow {
  id: number
  name: string
  address: string
  logo_url: string
  prover_gas: string
  proofs_won: number | string
  staked_prove: string // in PROVE tokens
  rewards_prove: string // in PROVE tokens
  apr_percent: number | string | null
  success_rate: number | string | null
  last_updated: string
  created_at: string
}

