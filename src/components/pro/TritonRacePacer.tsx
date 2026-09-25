import React, { useState, useMemo } from 'react'
import {
  generateOlympicRacePacing,
  formatSwimTime,
} from '../../lib/biomechanics/racePacingModel'
import {
  Timer,
  TrendingUp,
  Compass,
  Target,
} from 'lucide-react'

export const TritonRacePacer: React.FC = () => {
  const [distance, setDistance] = useState<50 | 100 | 200 | 400>(100)
  const [stroke, setStroke] = useState<'Freestyle' | 'Butterfly' | 'Backstroke' | 'Breaststroke' | 'IM'>('Freestyle')
  const [course, setCourse] = useState<'SCY' | 'LCM' | 'SCM'>('SCY')
  const [targetTime, setTargetTime] = useState<number>(56.5) // default 56.5s for 100 Free
  const [strategy, setStrategy] = useState<'negative_split' | 'even_pace' | 'aggressive_front'>('aggressive_front')

  const pacingPlan = useMemo(() => {
    return generateOlympicRacePacing({
      distance,
      stroke,
      targetTimeSeconds: targetTime,
      strategy,
      course,
    })
  }, [distance, stroke, targetTime, strategy, course])

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              TRITONWEAR & OMEGA ARES PACING MODEL
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <Timer className="w-5 h-5 text-white" />
              Olympic Race Split & Velocity Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Deconstructs competitive races into reaction time (0.64s), 15m breakout, clean swim speed (v = SR × DPS), and turn contact decay (0.28s).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-white/20 font-mono">
            <Target className="w-4 h-4 text-white" />
            <span className="text-xs text-neutral-300">
              Target: <strong className="text-white text-sm">{pacingPlan.formattedTargetTime}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4 font-mono">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Distance */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 uppercase">Race Distance:</label>
            <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-white/15">
              {[50, 100, 200, 400].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDistance(d as typeof distance)
                    if (d === 50) setTargetTime(25.4)
                    else if (d === 100) setTargetTime(56.5)
                    else if (d === 200) setTargetTime(202.0)
                    else setTargetTime(425.0)
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    distance === d
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          {/* Stroke */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 uppercase">Primary Stroke:</label>
            <select
              value={stroke}
              onChange={(e) => setStroke(e.target.value as typeof stroke)}
              className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="Freestyle">Freestyle</option>
              <option value="Butterfly">Butterfly</option>
              <option value="Backstroke">Backstroke</option>
              <option value="Breaststroke">Breaststroke</option>
              <option value="IM">Individual Medley</option>
            </select>
          </div>

          {/* Course */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 uppercase">Course Pool:</label>
            <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-white/15">
              {(['SCY', 'LCM', 'SCM'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCourse(c)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    course === c
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 uppercase">Tactical Pacing:</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as typeof strategy)}
              className="w-full bg-black border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
            >
              <option value="aggressive_front">Aggressive Front (Attack 1st 50)</option>
              <option value="even_pace">Even Pace (Threshold Hold)</option>
              <option value="negative_split">Negative Split (Back-Half Surge)</option>
            </select>
          </div>
        </div>

        {/* Target Time Slider */}
        <div className="pt-2 border-t border-white/10 space-y-1">
          <div className="flex justify-between text-xs text-neutral-400 font-mono">
            <span>Target Final Time:</span>
            <span className="text-white font-bold text-sm">
              {pacingPlan.formattedTargetTime} ({targetTime.toFixed(2)}s)
            </span>
          </div>
          <input
            type="range"
            min={distance === 50 ? 20 : distance === 100 ? 44 : distance === 200 ? 98 : 220}
            max={distance === 50 ? 38 : distance === 100 ? 80 : distance === 200 ? 180 : 360}
            step="0.1"
            value={targetTime}
            onChange={(e) => setTargetTime(Number(e.target.value))}
            className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
          />
        </div>
      </div>

      {/* Segment Splits Table (TritonWear / Omega Ares Breakdown) */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white" />
            Segmented Lap Telemetry
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span>Reaction: <strong className="text-white">{pacingPlan.reactionTimeSeconds}s</strong></span>
            <span>Stroke Index: <strong className="text-white">{pacingPlan.strokeIndex}</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-white/15 text-neutral-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Lap</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Split Time</th>
                <th className="py-2.5 px-3">Cumulative</th>
                <th className="py-2.5 px-3">Stroke Rate</th>
                <th className="py-2.5 px-3">DPS</th>
                <th className="py-2.5 px-3">Clean Velocity</th>
                <th className="py-2.5 px-3">Turn Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pacingPlan.laps.map((lap) => (
                <tr key={lap.lapNumber} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">#{lap.lapNumber}</td>
                  <td className="py-3 px-3 text-neutral-300">{lap.distanceMeters}m</td>
                  <td className="py-3 px-3 font-bold text-white">
                    {formatSwimTime(lap.splitSeconds)}
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {formatSwimTime(lap.cumulativeSeconds)}
                  </td>
                  <td className="py-3 px-3 text-neutral-300">{lap.strokeRateSpm} spm</td>
                  <td className="py-3 px-3 text-neutral-300">{lap.dpsMeters}m</td>
                  <td className="py-3 px-3 text-white font-semibold">
                    {lap.cleanSpeedMps} m/s
                  </td>
                  <td className="py-3 px-3 text-neutral-400">
                    {lap.turnContactSeconds ? `${lap.turnContactSeconds}s` : '-- (Dive)'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Coach Pacing Advice */}
        <div className="p-4 rounded-xl bg-black border border-white/15 space-y-1.5 font-sans">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              TritonWear Tactical Strategy Directive:
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {pacingPlan.coachPacingAdvice}
          </p>
        </div>
      </div>
    </div>
  )
}
