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
            className="w-full border-pink-300/50 dark:border-pink-900/50 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Rewards
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] [&>button]:hidden sm:w-[90vw] md:w-[85vw] lg:max-w-4xl xl:max-w-5xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-pink-300/50 dark:border-pink-900/50">
        {/* Custom Close */}
        <span
          aria-label="Close calculator"
          onClick={() => setOpen(false)}
          className="absolute right-3 cursor-pointer top-3 z-50 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 transition-colors duration-200 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
          Close
        </span>
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 space-y-4 sm:space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg sm:text-xl md:text-2xl font-mono text-pink-500 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="break-words">{proverName} — Rewards Calculator</span>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Calculate potential staking rewards with {proverName}. Enter your stake amount and adjust parameters.
            </DialogDescription>
            {proverAddress && (
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
                Prover: {proverAddress}
              </p>
            )}
          </DialogHeader>

          {/* Stake + APY + Price */}
          <div className="grid gap-4 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="stake" className="font-medium text-pink-500">
                Stake Amount (PROVE)
              </Label>
              <Input
                id="stake"
                type="text"
                inputMode="decimal"
                placeholder="5000"
                value={stakeStr}
                onChange={(e) => setStakeStr(e.target.value)}
                className="border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500"
              />
              <div className="pt-2">
                <Slider
                  value={[Math.min(Math.max(parseNum(stakeStr), 0), 100000)]}
                  onValueChange={(v) => setStakeStr(String(v[0]))}
                  min={0}
                  max={100000}
                  step={100}
                  className="[&_[role=slider]]:bg-pink-500 [&_.relative]:bg-pink-200 dark:[&_.relative]:bg-pink-900"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>100k</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {[1000, 5000, 10000, 25000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setStakeStr(String(v))}
                    className="text-xs px-3 py-1 rounded border border-pink-300/50 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/20 text-pink-500"
                  >
                    {v.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="apr" className="text-cyan-600 dark:text-cyan-400">
                APY (%)
              </Label>
              <Input
                id="apr"
                type="text"
                inputMode="decimal"
                placeholder="30"
                value={aprStr}
                onChange={(e) => setAprStr(e.target.value)}
                className="border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Base APY: {parseNum(defaultAPR).toFixed(2)}%
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-cyan-600 dark:text-cyan-400">
                PROVE Price (USD)
              </Label>
              <Input
                type="text"
                readOnly
                value={provePrice ? `$${provePrice.toFixed(2)}` : "Loading..."}
                className="bg-gray-50 dark:bg-gray-900 border-gray-300/50 dark:border-gray-700/50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time price
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <Label className="text-pink-500 font-medium">Duration</Label>
            <Tabs value={durationPreset} onValueChange={(v) => setDurationPreset(v as DurationPreset)} className="w-full">
              <TabsList className="grid grid-cols-4 w-full bg-gray-100 dark:bg-gray-900">
                <TabsTrigger value="day" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">1 Day</TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">30 Days</TabsTrigger>
                <TabsTrigger value="year" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">365 Days</TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">Custom</TabsTrigger>
              </TabsList>
            </Tabs>
            {durationPreset === "custom" && (
              <div className="max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="customDays">Custom Days</Label>
                  <Input
                    id="customDays"
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 90"
                    value={customDaysStr}
                    onChange={(e) => setCustomDaysStr(e.target.value)}
                    className="border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-pink-300/30 dark:bg-pink-900/30" />

          {/* Airdrops */}
          <div className="grid gap-4 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
            <AirdropEditor title="Hibachi Airdrop" state={hibachi} onChange={setHibachi} />
            <AirdropEditor title="Cysic Airdrop" state={cysic} onChange={setCysic} />
          </div>

          {/* Results */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryTile
              label="Rewards (Selected Duration)"
              primary={
                <span>
                  <span className="text-pink-500">{formatNum(durationTokens)}</span>{" "}
                  <span className="text-pink-500 font-bold">PROVE</span>
                </span>
              }
              secondary={
                provePrice
                  ? `≈ $${formatNum(toUSDFromPROVE(durationTokens, provePrice)!, 2)}`
                  : undefined
              }
            />
            <SummaryTile
              label="Total APY"
              primary={`${formatNum(totalApy, 2)}%`}
              secondary={`Base ${formatNum(baseApr, 2)}%${(hibachi.include || cysic.include) ? " + Airdrops" : ""}`}
            />
            <SummaryTile
              label="Annual Preview"
              primary={
                <span>
                  <span className="text-pink-500">{formatNum(perYearTokens)}</span>{" "}
                  <span className="text-pink-500 font-bold">PROVE</span>
                </span>
              }
              secondary={provePrice ? `≈ $${formatNum(toUSDFromPROVE(perYearTokens, provePrice)!, 2)}` : undefined}
            />
          </div>

          {/* Quick Rewards */}
          <Card className="border-pink-300/50 dark:border-pink-900/50">
            <CardContent className="pt-4">
              <div className="text-sm font-medium mb-3 text-pink-500">Quick Rewards Overview</div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                <QuickBig 
                  label="Per Day" 
                  value={<PinkAmount amount={formatNum(perDayTokens)} />}
                  usdValue={provePrice ? toUSDFromPROVE(perDayTokens, provePrice) : undefined}
                />
                <QuickBig 
                  label="Per 30 Days" 
                  value={<PinkAmount amount={formatNum(perMonthTokens)} />}
                  usdValue={provePrice ? toUSDFromPROVE(perMonthTokens, provePrice) : undefined}
                />
                <QuickBig 
                  label="Per Year" 
                  value={<PinkAmount amount={formatNum(perYearTokens)} />}
                  usdValue={provePrice ? toUSDFromPROVE(perYearTokens, provePrice) : undefined}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 sm:pt-4 border-t border-pink-300/30 dark:border-pink-900/30 mt-4 sm:mt-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={savePreset} 
                className="border-pink-300/50 dark:border-pink-900/50 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20"
              >
                Save Preset
              </Button>
              <Button 
                variant="outline" 
                onClick={resetPreset}
                className="border-gray-300/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Reset
              </Button>
              {saved && <span className="text-xs text-green-600 dark:text-green-400">Saved!</span>}
            </div>
            <Button 
              onClick={() => setOpen(false)} 
              className="bg-pink-500 hover:bg-pink-600 text-white border-pink-500"
            >
              Done
            </Button>
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
    <Card className="border-pink-300/50 dark:border-pink-900/50">
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium text-cyan-600 dark:text-cyan-400">{title}</div>
          <label htmlFor={id} className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              id={id}
              type="checkbox"
              checked={state.include}
              onChange={(e) => onChange({ ...state, include: e.target.checked })}
              className="h-4 w-4 rounded border"
              style={{ accentColor: "#fe11c5" }}
            />
            <span className="text-sm">Include</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Airdrop %</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={state.percentStr}
              onChange={(e) => onChange({ ...state, percentStr: e.target.value })}
              className="border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500">e.g. 0.05 for 0.05%</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">FDV (USD)</Label>
            <Input
              type="text"
              inputMode="decimal"
              value={state.tokenFdvUsdStr}
              onChange={(e) => onChange({ ...state, tokenFdvUsdStr: e.target.value })}
              placeholder="500000000"
              className="border-pink-300/50 dark:border-pink-900/50 focus:border-pink-500"
            />
            <p className="text-xs text-gray-500">
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
    <div className="rounded-lg sm:rounded-xl border border-pink-300/50 dark:border-pink-900/50 px-2 sm:px-3 md:px-4 py-2 sm:py-3 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
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
    <Card className="border-pink-300/50 dark:border-pink-900/50">
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
    <div className="rounded-lg border border-pink-300/30 dark:border-pink-900/30 p-3 bg-gradient-to-br from-white to-pink-50 dark:from-black dark:to-pink-950/30">
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
