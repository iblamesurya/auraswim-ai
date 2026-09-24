import React, { useState } from 'react'
import { calculateACWR } from '../../lib/biomechanics/acwrModel'
import { Activity, Info } from 'lucide-react'

export const InjuryRiskGauge: React.FC = () => {
  const [acuteMeters, setAcuteMeters] = useState<number>(36000)
  const [chronicMeters, setChronicMeters] = useState<number>(30000)

  const result = calculateACWR(acuteMeters, chronicMeters)

  // Clamp percentage for needle gauge (0 to 2.2 maps to 0% to 100%)
  const gaugePercent = Math.min(100, Math.max(0, (result.acwr / 2.0) * 100))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Acute-to-Chronic Workload Ratio (ACWR) & Shoulder Risk
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Gabbett Sports Science Model: Compares this week's load against past 28-day chronic baseline to prevent rotator cuff tears.
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            result.riskZone === 'optimal'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : result.riskZone === 'undertrained'
              ? 'bg-sky-950 text-sky-400 border border-sky-800'
              : result.riskZone === 'elevated_risk'
              ? 'bg-amber-950 text-amber-400 border border-amber-800'
              : 'bg-rose-950 text-rose-400 border border-rose-800'
          }`}
        >
          {result.riskLabel.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Gauge */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-48 h-24 overflow-hidden flex items-end justify-center">
            {/* Semicircle track */}
            <div className="absolute top-0 w-48 h-48 rounded-full border-[18px] border-slate-800 border-b-transparent border-l-transparent transform -rotate-45"></div>
            {/* Color segments */}
            <div className="text-center z-10">
              <span className="text-4xl font-extrabold text-white font-mono">
                {result.acwr.toFixed(2)}
              </span>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider">
                ACWR Score
              </span>
            </div>
          </div>

          {/* Linear bar representation */}
          <div className="w-full space-y-1.5">
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="w-[40%] bg-sky-600/70" title="Undertrained (< 0.8)"></div>
              <div className="w-[25%] bg-emerald-500" title="Sweet Spot (0.8 - 1.3)"></div>
              <div className="w-[10%] bg-amber-500" title="Elevated Risk (1.3 - 1.5)"></div>
              <div className="w-[25%] bg-rose-500" title="Danger Spike (> 1.5)"></div>
              {/* Pointer */}
              <div
                className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg transition-all duration-300"
                style={{ left: `calc(${gaugePercent}% - 3px)` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0 (Low)</span>
              <span className="text-emerald-400">0.8 - 1.3 (Optimal)</span>
              <span className="text-rose-400">1.5+ (Danger)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full text-center pt-2 border-t border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Injury Probability</span>
              <p className={`text-sm font-bold ${result.color}`}>{result.injuryProbability}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase">Training Phase</span>
              <p className="text-sm font-bold text-slate-200">
                {result.riskZone === 'optimal' ? 'Progressive Overload' : 'Spike Alert'}
              </p>
            </div>
          </div>
        </div>

        {/* Inputs & Recommendations */}
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Recent 7-Day Acute Load (Meters / Volume):</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {acuteMeters.toLocaleString()} m
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="75000"
                step="1000"
                value={acuteMeters}
                onChange={(e) => setAcuteMeters(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Chronic 28-Day Average Weekly Baseline:</span>
                <span className="font-mono text-slate-300 font-bold">
                  {chronicMeters.toLocaleString()} m
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="75000"
                step="1000"
                value={chronicMeters}
                onChange={(e) => setChronicMeters(Number(e.target.value))}
                className="w-full accent-slate-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Coaching Advice */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sports Science Recommendation:
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {result.coachingRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
