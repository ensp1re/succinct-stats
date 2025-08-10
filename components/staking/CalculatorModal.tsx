"use client"

import * as React from "react"
import { X, Calculator, TrendingUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import {
  calcBaseRewardsPROVE,
  daysForPreset,
  formatNum,
  impliedAprFromAirdrop,
  toUSDFromPROVE,
  type DurationPreset,
} from "@/lib/calculations"
import { useProvePrice } from "@/hooks/use-prove-price"

const PRESET_KEY = "prove_calc_preset_v2"

type AirdropState = {
  name: string
  percentStr: string        // e.g. "0.05" for 0.05%
  tokenFdvUsdStr: string    // e.g. "500000000" for 500M FDV
  include: boolean          // whether to include in APR
}

export type CalculatorModalProps = {
  proverName?: string
  proverAddress?: string
  defaultAPR?: number | string
  defaultSuccessRate?: number | string
  defaultGas?: string
  children?: React.ReactNode
}

function parseNum(input: string | number): number {
  if (typeof input === 'number') return Number.isFinite(input) ? input : 0
  if (input == null) return 0
  const s = String(input).replace(/,/g, "").replace(/%/g, "").trim()
  if (s === "" || s === "." || s === "-") return 0
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

export function CalculatorModal({
  proverName = "Prover",
  proverAddress = "",
  defaultAPR = 30,
  defaultSuccessRate = 100,
  defaultGas = "0",
  children
}: CalculatorModalProps) {
  const [open, setOpen] = React.useState(false)

  // Inputs (strings so floats can be typed)
  const [stakeStr, setStakeStr] = React.useState("5000")
  const [aprStr, setAprStr] = React.useState(String(parseNum(defaultAPR)))
  const [durationPreset, setDurationPreset] = React.useState<DurationPreset>("month")
  const [customDaysStr, setCustomDaysStr] = React.useState("30")

  const [hibachi, setHibachi] = React.useState<AirdropState>({
    name: "Hibachi",
    percentStr: "0.05",
    tokenFdvUsdStr: "500000000",
    include: false,
  })
  const [cysic, setCysic] = React.useState<AirdropState>({
    name: "Cysic",
    percentStr: "0.05",
    tokenFdvUsdStr: "500000000",
    include: false,
  })

  // Load preset from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY)
      if (!raw) return
      const p = JSON.parse(raw)
      if (p?.stakeStr) setStakeStr(p.stakeStr)
      if (p?.durationPreset) setDurationPreset(p.durationPreset)
      if (p?.customDaysStr) setCustomDaysStr(p.customDaysStr)
      if (p?.hibachi) setHibachi(p.hibachi)
      if (p?.cysic) setCysic(p.cysic)
    } catch {}
  }, [])

  // Update APR when defaultAPR changes
  React.useEffect(() => {
    setAprStr(String(parseNum(defaultAPR)))
  }, [defaultAPR])

  // Parsed numbers
  const stake = parseNum(stakeStr)
  const baseApr = parseNum(aprStr)
  const customDays = Math.max(0, Math.floor(parseNum(customDaysStr)))
  const days = durationPreset === "custom" ? customDays : daysForPreset(durationPreset)

  const { price: provePrice } = useProvePrice()

  // Implied APYs from airdrops
  const TOTAL_SUPPLY = 1_000_000_000 // 1 billion tokens
  
  const hibachiImpliedApy = hibachi.include
    ? impliedAprFromAirdrop(parseNum(hibachi.percentStr), parseNum(hibachi.tokenFdvUsdStr) / TOTAL_SUPPLY, provePrice ?? undefined)
    : 0
  const cysicImpliedApy = cysic.include
    ? impliedAprFromAirdrop(parseNum(cysic.percentStr), parseNum(cysic.tokenFdvUsdStr) / TOTAL_SUPPLY, provePrice ?? undefined)
    : 0

  // Total APY = base + airdrops
  const totalApy = baseApr + hibachiImpliedApy + cysicImpliedApy

  // Rewards calculations
  const perDayTokens = calcBaseRewardsPROVE(stake, totalApy, 1)
  const perMonthTokens = calcBaseRewardsPROVE(stake, totalApy, 30)
  const perYearTokens = calcBaseRewardsPROVE(stake, totalApy, 365)
  const durationTokens = calcBaseRewardsPROVE(stake, totalApy, days)
  const durationUsd = toUSDFromPROVE(durationTokens, provePrice ?? undefined)

  // Save preset
  const [saved, setSaved] = React.useState(false)
  const savePreset = () => {
    try {
      const preset = {
        stakeStr,
        durationPreset,
        customDaysStr,
        hibachi,
        cysic,
      }
      localStorage.setItem(PRESET_KEY, JSON.stringify(preset))
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {}
  }

  const resetPreset = () => {
    setStakeStr("5000")
    setDurationPreset("month")
    setCustomDaysStr("30")
    setHibachi({
      name: "Hibachi",
      percentStr: "0.05",
      tokenFdvUsdStr: "500000000",
      include: false,
    })
    setCysic({
      name: "Cysic",
      percentStr: "0.05",
      tokenFdvUsdStr: "500000000",
      include: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-pink-500/50 text-pink-500 hover:bg-pink-500/10"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Rewards
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[90vw] [&>button]:hidden sm:w-[80vw] md:w-[70vw] lg:max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-100 dark:bg-[#050505] border border-gray-300 dark:border-pink-900/50">
        {/* Custom Close */}
        <span
          aria-label="Close calculator"
          onClick={() => setOpen(false)}
          className="absolute right-2 cursor-pointer top-2 z-50 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="h-3 w-3" />
          Close
        </span>
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="text-center border-b border-gray-300 dark:border-pink-900/50 pb-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-pink-500 mb-1">
              {proverName}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Rewards Calculator
            </p>
          </div>

          {/* Compact Input Grid */}
          <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="stake" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Stake Amount
              </Label>
              <div className="relative">
                <Input
                  id="stake"
                  type="text"
                  inputMode="decimal"
                  placeholder="5000"
                  value={stakeStr}
                  onChange={(e) => setStakeStr(e.target.value)}
                  className="text-right font-bold h-8 text-sm rounded pr-14 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-pink-900/50 focus:border-pink-500 focus:ring-0 focus:ring-offset-0"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-pink-500 font-semibold">
                  PROVE
                </span>
              </div>
              <div className="flex gap-1">
                {[1000, 5000, 10000, 25000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStakeStr(String(v))}
                    className="text-xs px-1 py-0.5 rounded border border-gray-300 dark:border-pink-900/50 hover:border-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 text-gray-600 dark:text-gray-400"
                  >
                    {v >= 1000 ? `${v/1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">APY</Label>
              <div className="text-center rounded p-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-pink-900/50">
                <div className="text-lg font-bold text-pink-500">
                  {parseNum(aprStr).toFixed(1)}%
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Base: {formatNum(baseApr, 1)}% + Airdrop: {formatNum(totalApy - baseApr, 1)}%
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">PROVE Price</Label>
              <div className="text-center rounded p-2 bg-gray-50 dark:bg-[#0a0a0a] border border-gray-300 dark:border-pink-900/50">
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {provePrice ? `$${provePrice.toFixed(2)}` : "Loading..."}
                </div>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Time Period
            </Label>
            <Tabs value={durationPreset} onValueChange={(v) => setDurationPreset(v as DurationPreset)} className="w-full">
              <TabsList className="grid grid-cols-3 w-full bg-gray-100 dark:bg-gray-800 h-10">
                <TabsTrigger value="day" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white font-medium">1 Day</TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white font-medium">30 Days</TabsTrigger>
                <TabsTrigger value="year" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white font-medium">1 Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Compact Results */}
          <div className="bg-white dark:bg-[#050505] rounded-xl p-4 border border-gray-300 dark:border-pink-900/50 shadow-lg shadow-pink-300/10 dark:shadow-pink-500/10">
            <div className="text-center mb-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Rewards for staking <span className="text-pink-500 font-semibold">{formatNum(stake)} PROVE</span>
              </p>
              <div className="text-3xl font-bold text-pink-500 mb-1">
                {formatNum(durationTokens)}
              </div>
              <div className="text-sm text-pink-500 font-medium">PROVE</div>
              {provePrice && (
                <div className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-2">
                  ≈ ${formatNum(toUSDFromPROVE(durationTokens, provePrice)!, 2)}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2 border border-gray-300 dark:border-pink-900/50">
                <div className="text-sm font-bold text-pink-500">{formatNum(perDayTokens, 1)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Per Day</div>
              </div>
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2 border border-gray-300 dark:border-pink-900/50">
                <div className="text-sm font-bold text-pink-500">{formatNum(perMonthTokens)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Per Month</div>
              </div>
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2 border border-gray-300 dark:border-pink-900/50">
                <div className="text-sm font-bold text-pink-500">{formatNum(perYearTokens)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Per Year</div>
              </div>
            </div>
          </div>

          {/* Additional Rewards Section */}
          <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
            <AirdropEditor title="Hibachi Airdrop" state={hibachi} onChange={setHibachi} />
            <AirdropEditor title="Cysic Airdrop" state={cysic} onChange={setCysic} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AirdropEditor({
  title,
  state,
  onChange,
}: {
  title: string
  state: AirdropState
  onChange: (s: AirdropState) => void
}) {
  const id = `${title.toLowerCase().replace(/\s+/g, "-")}-include`
  return (
    <Card className="border-gray-300 dark:border-pink-900/50 bg-white dark:bg-[#050505]">
      <CardContent className="pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">{title}</div>
          <label htmlFor={id} className="inline-flex items-center gap-1 cursor-pointer select-none">
            <input
              id={id}
              type="checkbox"
              checked={state.include}
              onChange={(e) => onChange({ ...state, include: e.target.checked })}
              className="h-3 w-3 rounded border"
              style={{ accentColor: "#ec4899" }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">Include</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-xs text-gray-700 dark:text-gray-300">Airdrop %</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={state.percentStr}
              onChange={(e) => onChange({ ...state, percentStr: e.target.value })}
              className="border-gray-300 dark:border-pink-900/50 focus:border-pink-500 bg-white dark:bg-gray-800 h-7 text-xs"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">e.g. 0.05 for 0.05%</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-700 dark:text-gray-300">FDV (USD)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={state.tokenFdvUsdStr}
              onChange={(e) => onChange({ ...state, tokenFdvUsdStr: e.target.value })}
              placeholder="500000000"
              className="border-gray-300 dark:border-pink-900/50 focus:border-pink-500 bg-white dark:bg-gray-800 h-7 text-xs"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              1B supply (e.g. 500M = $0.5/token)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg sm:rounded-xl border border-[#fe11c5]/50 px-2 sm:px-3 md:px-4 py-2 sm:py-3 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{label}</div>
      <div className="font-semibold text-sm sm:text-base text-gray-800 dark:text-white break-words">{value}</div>
    </div>
  )
}

function SummaryTile({
  label,
  primary,
  secondary,
}: {
  label: string
  primary: React.ReactNode
  secondary?: string
}) {
  return (
    <Card className="border-[#fe11c5]/50">
      <CardContent className="pt-4">
        <div className="text-xs uppercase tracking-wide text-cyan-600 dark:text-cyan-400 mb-2">{label}</div>
        <div className="text-xl font-semibold mb-1">{primary}</div>
        {secondary && <div className="text-xs text-gray-500 dark:text-gray-400">{secondary}</div>}
      </CardContent>
    </Card>
  )
}

function QuickBig({ label, value, usdValue }: { label: string; value: React.ReactNode; usdValue?: number }) {
  return (
    <div className="rounded-lg border border-[#fe11c5]/30 p-3 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30">
      <div className="text-xs uppercase tracking-wide text-cyan-600 dark:text-cyan-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      {usdValue !== undefined && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ≈ ${formatNum(usdValue, 2)}
        </div>
      )}
    </div>
  )
}

function PinkAmount({ amount }: { amount: string }) {
  return (
    <span>
      <span className="text-pink-500">{amount}</span>{" "}
      <span className="text-pink-500 font-bold">PROVE</span>
    </span>
  )
}
