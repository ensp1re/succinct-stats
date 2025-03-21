export interface LeaderboardEntry {
  rank: string
  name: string
  invitedBy: string
  proofs: string
  cycles: string
  stars: string
}

export interface UserData {
  stars: number
  proofs: number
  cycles: number
}

export interface NetworkData {
  totalProvers: number
  totalStars: number
  totalCycles: number
  totalProofs: number
}

