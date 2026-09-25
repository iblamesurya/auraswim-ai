import React, { useState, useEffect } from 'react'
import { calculateACWR } from '../../lib/biomechanics/acwrModel'
import { loadSwimmerData } from '../../lib/storage/swimmerStore'
import { Activity, Info, RefreshCw } from 'lucide-react'

export const InjuryRiskGauge: React.FC = () => {
  const [acuteMeters, setAcuteMeters] = useState<number>(0)
  const [chronicMeters, setChronicMeters] = useState<number>(0)
  const [useJournalData, setUseJournalData] = useState<boolean>(true)
  const [weekOverWeekChange, setWeekOverWeekChange] = useState<number>(0)
  const [hasWeeklySpike, setHasWeeklySpike] = useState<boolean>(false)

  useEffect(() => {
    const data = loadSwimmerData()
    const workouts = data.workouts || []

    if (workouts.length > 0 && useJournalData) {
      const now = Date.now()
      const sevenDaysAgo = now - 7 * 86400000
      const fourteenDaysAgo = now - 14 * 86400000
      const twentyEightDaysAgo = now - 28 * 86400000

      const acuteSum = workouts
        .filter((w) => new Date(w.date).getTime() >= sevenDaysAgo)
        .reduce((sum, w) => sum + w.meters, 0)

      const prevWeekSum = workouts
        .filter((w) => {
          const t = new Date(w.date).getTime()
          return t < sevenDaysAgo && t >= fourteenDaysAgo
        })
        .reduce((sum, w) => sum + w.meters, 0)

      const chronicSum = workouts
        .filter((w) => new Date(w.date).getTime() >= twentyEightDaysAgo)
        .reduce((sum, w) => sum + w.meters, 0)
      const chronicAvg = Math.round(chronicSum / 4)

      setAcuteMeters(acuteSum)
      setChronicMeters(chronicAvg)

      if (prevWeekSum > 0) {
        const deltaPct = Math.round(((acuteSum - prevWeekSum) / prevWeekSum) * 100)
        setWeekOverWeekChange(deltaPct)
        setHasWeeklySpike(deltaPct >= 15)
      } else {
        setWeekOverWeekChange(0)
        setHasWeeklySpike(false)
      }
    } else if (!useJournalData) {
      // Default manual calibration starting points if user is testing
      if (acuteMeters === 0) setAcuteMeters(30000)
      if (chronicMeters === 0) setChronicMeters(28000)
      setHasWeeklySpike(acuteMeters > chronicMeters * 1.15)
      setWeekOverWeekChange(Math.round(((acuteMeters - chronicMeters) / (chronicMeters || 1)) * 100))
    }
  }, [useJournalData, acuteMeters, chronicMeters])

  const result = calculateACWR(acuteMeters, chronicMeters)
  const gaugePercent = Math.min(100, Math.max(0, (result.acwr / 2.0) * 100))

  return (
    <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Acute-to-Chronic Workload Ratio (ACWR) & Rotator Cuff Risk
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Gabbett Biomechanical Model & Blanch-Gabbett (2016) week-over-week spike analysis for swimmer shoulder protection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseJournalData(!useJournalData)}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-white/20 text-neutral-300 hover:text-white hover:border-white transition-all flex items-center gap-1 font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            {useJournalData ? 'Journal Auto-Sync: ON' : 'Manual Sliders: ACTIVE'}
          </button>
          <span className="px-3 py-1 text-xs font-mono font-semibold rounded-lg border border-white/20 bg-white/5 text-white">
            {result.riskLabel.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Week-over-Week Spike Warning Card */}
      {hasWeeklySpike && (
        <div className="p-4 rounded-xl bg-black border-2 border-white text-white flex items-start gap-3">
          <div className="p-1 rounded bg-white text-black font-mono font-bold text-xs">
            !
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
              WEEKLY LOAD SPIKE WARNING (+{weekOverWeekChange}% vs previous week)
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Blanch & Gabbett (2016) clinical finding: Weekly training volume increases exceeding +15% double the relative risk of supraspinatus tendon thickening and impingement. Keep daily sets capped and enforce pre-swim subscapularis SMR.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Monochromatic Visual Gauge */}
        <div className="bg-black p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center">
            {/* Semicircle track */}
            <div className="absolute top-0 w-48 h-48 rounded-full border-[18px] border-neutral-900 border-b-transparent border-l-transparent transform -rotate-45" />
            {/* Color segments */}
            <div className="text-center z-10">
              <span className="text-4xl font-extrabold text-white font-mono">
                {result.acwr.toFixed(2)}
              </span>
              <span className="block text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                ACWR Ratio
              </span>
            </div>
          </div>

          {/* Monochromatic linear bar representation */}
          <div className="w-full space-y-1.5">
            <div className="relative w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden flex border border-white/10">
              <div className="w-[40%] bg-neutral-700" title="Low Load (< 0.8)" />
              <div className="w-[25%] bg-white" title="Optimal Sweet Spot (0.8 - 1.3)" />
              <div className="w-[10%] bg-neutral-500" title="Elevated Risk (1.3 - 1.5)" />
              <div className="w-[25%] bg-neutral-800" title="Danger Spike (> 1.5)" />
              {/* Pointer */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] transition-all duration-300"
                style={{ left: `calc(${gaugePercent}% - 3px)` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>0.0 Low</span>
              <span className="text-white font-bold">0.8 - 1.3 Sweet Spot</span>
              <span>1.5+ Spike</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-center pt-2 border-t border-white/10 font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">Shoulder Tendinopathy Risk</span>
              <p className="text-sm font-bold text-white">{result.injuryProbability}</p>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase">Training Phase</span>
              <p className="text-sm font-bold text-white">
                {result.riskZone === 'optimal' ? 'Conditioning Sweet Spot' : result.riskZone === 'undertrained' ? 'Sub-Threshold' : 'Volume Spike Alert'}
              </p>
            </div>
          </div>
        </div>

        {/* Inputs & Recommendations */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Recent 7-Day Acute Volume:</span>
                <span className="font-mono text-white font-bold">
                  {acuteMeters.toLocaleString()} m
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="75000"
                step="500"
                value={acuteMeters}
                onChange={(e) => {
                  setUseJournalData(false)
                  setAcuteMeters(Number(e.target.value))
                }}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1">
                <span>Chronic 28-Day Average Weekly Baseline:</span>
                <span className="font-mono text-white font-bold">
                  {chronicMeters.toLocaleString()} m
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="75000"
                step="500"
                value={chronicMeters}
                onChange={(e) => {
                  setUseJournalData(false)
                  setChronicMeters(Number(e.target.value))
                }}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
            </div>
          </div>

          {/* Sports Science Advice */}
          <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Gabbett Biomechanical Directives:
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {result.coachingRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
