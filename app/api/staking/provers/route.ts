import { NextResponse } from "next/server"
import { getEnhancedProverAggregates } from "@/lib/staking.service"

export async function GET() {
  try {
    const data = await getEnhancedProverAggregates()
    return NextResponse.json({ provers: data }, { status: 200 })
  } catch (error: any) {
    console.error('Error in provers API:', error)
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}


