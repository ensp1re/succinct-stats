import { NextResponse } from "next/server"
import { getTotalsSummary } from "@/lib/staking.service"

export async function GET() {
  try {
    const data = await getTotalsSummary()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 })
  }
}


