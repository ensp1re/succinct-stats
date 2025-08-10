import { NextRequest, NextResponse } from "next/server"
import { getStakingTimeseries } from "@/lib/staking.service"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = (searchParams.get("period") as "day" | "week" | "month") || "day"
    const data = await getStakingTimeseries(period)
    return NextResponse.json({ series: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}


