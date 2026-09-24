import React, { useState } from 'react'
import { calculateStrokeMetrics, predictPacingCorridor } from '../../lib/biomechanics/swimmingKinematics'
import { Gauge, Zap } from 'lucide-react'

export const MetricsTracker: React.FC = () => {
  const [distance, setDistance] = useState<number>(50)
  const [timeSec, setTimeSec] = useState<number>(29.5)
  const [strokes, setStrokes] = useState<number>(31)
  const [event, setEvent] = useState<'50m' | '100m' | '200m' | '400m'>('100m')
  const [targetTime, setTargetTime] = useState<number>(58.0)

  const metrics = calculateStrokeMetrics(distance, timeSec, strokes)
  const pacing = predictPacingCorridor(targetTime, event)

  return (
    <div className="space-y-6">
      {/* Stroke Kinematics Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Stroke Rate, Distance Per Stroke (DPS) & SWOLF
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time calculation of swimming velocity, stroke efficiency, and stroke rate vs. distance balance.
          </p>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Clean Velocity
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
              {metrics.velocityMps} <span className="text-sm font-normal text-slate-400">m/s</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Pace: {metrics.pacePer100mSec}s / 100m
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Stroke Rate (SR)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono">
              {metrics.strokeRateSpm}{' '}
              <span className="text-sm font-normal text-slate-400">spm</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Cadence: {(60 / (metrics.strokeRateSpm || 1)).toFixed(2)}s / stroke
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              Distance Per Stroke
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {metrics.distancePerStrokeMeters}{' '}
              <span className="text-sm font-normal text-slate-400">m</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Distance per single arm pull
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider">
              SWOLF Efficiency
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono">
              {metrics.swolf}
            </div>
            <span className={`text-[10px] font-semibold block ${metrics.color}`}>
              {metrics.efficiencyLabel}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Pool Distance (m):</label>
            <div className="flex gap-2">
              {[25, 50, 100].map((d) => (
                <button
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    distance === d
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Split Time:</span>
              <span className="font-mono text-cyan-400">{timeSec}s</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="0.5"
              value={timeSec}
              onChange={(e) => setTimeSec(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Stroke Count:</span>
              <span className="font-mono text-emerald-400">{strokes}</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              value={strokes}
              onChange={(e) => setStrokes(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Pacing Corridor Predictor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">
                Race Pacing Corridor & Split Predictor
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Optimizes the non-linear interaction between stroke rate and stroke length across race halves.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['50m', '100m', '200m', '400m'] as const).map((ev) => (
              <button
                key={ev}
                onClick={() => {
                  setEvent(ev)
                  if (ev === '50m') setTargetTime(26.0)
                  if (ev === '100m') setTargetTime(58.0)
                  if (ev === '200m') setTargetTime(126.0)
                  if (ev === '400m') setTargetTime(270.0)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  event === ev
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 uppercase">Target Split Corridor</span>
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-xl font-bold text-sky-400">{pacing.firstHalfSplit}s</span>
              <span className="text-slate-500">/</span>
              <span className="text-xl font-bold text-cyan-400">{pacing.secondHalfSplit}s</span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              1st Half vs 2nd Half Split Target
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 uppercase">Cadence Targets</span>
            <div className="flex items-baseline gap-3 font-mono">
              <span className="text-lg font-bold text-emerald-400">
                {pacing.targetStrokeRateSpm} spm
              </span>
              <span className="text-lg font-bold text-purple-400">
                {pacing.targetDpsMeters}m DPS
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block">
              Optimal biomechanical corridor
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase">Race Strategy</span>
            <p className="text-xs text-slate-300 leading-relaxed">{pacing.pacingStrategy}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
