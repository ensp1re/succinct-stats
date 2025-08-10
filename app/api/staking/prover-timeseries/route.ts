import { NextRequest, NextResponse } from "next/server"
import { getProverTimeseries } from "@/lib/staking.service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const prover = searchParams.get("address")
    if (!prover) return NextResponse.json({ error: "Missing address" }, { status: 400 })
    const data = await getProverTimeseries(prover)
    return NextResponse.json({ series: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}


