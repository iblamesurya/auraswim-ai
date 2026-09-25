import React, { useState } from 'react'
import { calculateStrokeMetrics, predictPacingCorridor } from '../../lib/biomechanics/swimmingKinematics'
import { Gauge, Zap } from 'lucide-react'

export const MetricsTracker: React.FC = () => {
  const [distance, setDistance] = useState<number>(50)
  const [timeSec, setTimeSec] = useState<number>(29.5)
  const [strokes, setStrokes] = useState<number>(31)
  const [underwaterBreakout, setUnderwaterBreakout] = useState<number>(8) // Standard 8m breakout glide
  const [event, setEvent] = useState<'50m' | '100m' | '200m' | '400m'>('100m')
  const [targetTime, setTargetTime] = useState<number>(58.0)

  const metrics = calculateStrokeMetrics(distance, timeSec, strokes, underwaterBreakout)
  const pacing = predictPacingCorridor(targetTime, event)

  return (
    <div className="space-y-6 text-white">
      {/* Stroke Kinematics Calculator */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-white" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Stroke Kinematics, Clean DPS & Stroke Index (SI)
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Olympic physical decomposition with underwater breakout subtraction, true surface DPS, and Costill Stroke Index ($SI = v \times DPS$).
          </p>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              Velocity
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {metrics.velocityMps} <span className="text-xs font-normal text-neutral-400">m/s</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Pace: {metrics.pacePer100mSec}s/100m
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              Stroke Rate (SR)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {metrics.strokeRateSpm}{' '}
              <span className="text-xs font-normal text-neutral-400">spm</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Cadence: {(60 / (metrics.strokeRateSpm || 1)).toFixed(2)}s/cyc
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              Clean DPS
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {metrics.cleanDpsMeters}{' '}
              <span className="text-xs font-normal text-neutral-400">m</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Raw: {metrics.distancePerStrokeMeters}m (minus {underwaterBreakout}m)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              Stroke Index (SI)
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {metrics.strokeIndexM2s}{' '}
              <span className="text-xs font-normal text-neutral-400">m²/s</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono block">
              Aerobic Economy (Costill)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              Coordination (IdC)
            </span>
            <div className="text-base font-bold text-white font-mono uppercase mt-0.5">
              {metrics.idcMode?.replace('_', ' ')}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono block truncate" title={metrics.idcDescription}>
              Chollet Model
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              SWOLF Score
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
              {metrics.swolf}
            </div>
            <span className="text-[10px] font-mono text-neutral-300 block truncate">
              {metrics.efficiencyRating.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-white/10 font-mono">
          <div>
            <label className="text-xs text-neutral-400 block mb-1">Pool Distance (m):</label>
            <div className="flex gap-2">
              {[25, 50, 100].map((d) => (
                <button
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    distance === d
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-neutral-400 border-white/15 hover:border-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Split Time:</span>
              <span className="text-white font-bold">{timeSec}s</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              step="0.5"
              value={timeSec}
              onChange={(e) => setTimeSec(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Stroke Count:</span>
              <span className="text-white font-bold">{strokes}</span>
            </div>
            <input
              type="range"
              min="15"
              max="65"
              value={strokes}
              onChange={(e) => setStrokes(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Breakout Glide (m):</span>
              <span className="text-white font-bold">{underwaterBreakout}m</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={underwaterBreakout}
              onChange={(e) => setUnderwaterBreakout(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-neutral-500">
              <span>0m</span>
              <span>15m (FINA limit)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pacing Corridor Predictor */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-white" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Race Pacing Corridor & Split Predictor
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Mathematical modeling of speed retention across race segments (Reaction, Clean Speed, Turn Contact).
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-white/15">
            {(['50m', '100m', '200m', '400m'] as const).map((ev) => (
              <button
                key={ev}
                onClick={() => {
                  setEvent(ev)
                  if (ev === '50m') setTargetTime(26.0)
                  if (ev === '100m') setTargetTime(58.0)
                  if (ev === '200m') setTargetTime(125.0)
                  if (ev === '400m') setTargetTime(265.0)
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition-all ${
                  event === ev
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        {/* Target Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-neutral-400 font-mono">
            <span>Target Race Time:</span>
            <span className="text-white font-bold text-sm">
              {targetTime.toFixed(1)}s
            </span>
          </div>
          <input
            type="range"
            min={event === '50m' ? 21 : event === '100m' ? 46 : event === '200m' ? 104 : 220}
            max={event === '50m' ? 36 : event === '100m' ? 80 : event === '200m' ? 170 : 350}
            step="0.5"
            value={targetTime}
            onChange={(e) => setTargetTime(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
          />
        </div>

        {/* Splits breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-3.5 rounded-xl bg-black border border-white/10">
            <span className="text-[10px] text-neutral-400 uppercase">First 50m / Lap 1</span>
            <div className="text-xl font-bold text-white mt-1">
              {pacing.firstHalfSplit}s
            </div>
            <span className="text-[10px] text-neutral-500">Dive start & 15m breakout</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10">
            <span className="text-[10px] text-neutral-400 uppercase">Back-Half Split</span>
            <div className="text-xl font-bold text-white mt-1">
              {pacing.secondHalfSplit}s
            </div>
            <span className="text-[10px] text-neutral-500">
              Differential: +{(pacing.secondHalfSplit - pacing.firstHalfSplit).toFixed(1)}s
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10">
            <span className="text-[10px] text-neutral-400 uppercase">Target Stroke Rate</span>
            <div className="text-xl font-bold text-white mt-1">
              {pacing.targetStrokeRateSpm} spm
            </div>
            <span className="text-[10px] text-neutral-500">Target DPS: ~{pacing.targetDpsMeters}m</span>
          </div>
        </div>

        {/* Pacing Advice */}
        <div className="p-3.5 rounded-xl bg-black border border-white/10 text-xs text-neutral-300">
          <strong className="text-white font-mono block mb-1">Olympic Strategy Directive:</strong>
          {pacing.pacingStrategy}
        </div>
      </div>
    </div>
  )
}
