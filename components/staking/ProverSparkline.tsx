"use client"

import { ReactElement } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts"

export function ProverSparkline({ data }: { data: Array<{ x: string; y: number }> }): ReactElement {
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <Line type="monotone" dataKey="y" stroke="#22d3ee" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


