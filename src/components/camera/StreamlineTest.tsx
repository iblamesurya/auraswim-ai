import React, { useState } from 'react'
import { calculateStreamlineWithLumbarCompensation } from '../../lib/biomechanics/angleCalculators'
import type { Point2D } from '../../lib/biomechanics/angleCalculators'
import { Award, Info, AlertTriangle, Sliders } from 'lucide-react'

export const StreamlineTest: React.FC = () => {
  const [wristY, setWristY] = useState(30)
  const [lumbarArchX, setLumbarArchX] = useState(150) // 150 is neutral straight spine

  // 4-Point kinetic chain: Ankle -> Hip -> Lumbar -> Shoulder -> Wrist
  const ankle: Point2D = { x: 150, y: 340 }
  const hip: Point2D = { x: 150, y: 265 }
  const lumbar: Point2D = { x: lumbarArchX, y: 215 }
  const shoulder: Point2D = { x: 150, y: 165 }
  const wrist: Point2D = { x: 150, y: wristY }

  const result = calculateStreamlineWithLumbarCompensation({
    ankle,
    hip,
    lumbar,
    shoulder,
    wrist,
  })

  return (
    <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm text-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Award className="w-5 h-5 text-white" />
            4-Point Streamline & Lumbar Compensation Diagnostic
          </h3>
          <p className="text-xs text-neutral-400">
            Measures true glenohumeral reach and detects compensatory lower-back arching (anterior pelvic tilt).
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
            result.hasLumbarCheat
              ? 'bg-white text-black border-white'
              : 'border-white/20 bg-black text-white'
          }`}>
            {result.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Pose Canvas */}
        <div className="relative bg-black rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center min-h-[350px]">
          <svg
            viewBox="0 0 300 370"
            className="w-full max-w-[260px] h-[320px] overflow-visible"
          >
            {/* Neutral vertical plumb reference */}
            <line
              x1="150"
              y1="10"
              x2="150"
              y2="360"
              stroke="#333333"
              strokeDasharray="4 4"
            />

            {/* Kinetic Chain Lines */}
            {/* Ankle to Hip */}
            <line x1={ankle.x} y1={ankle.y} x2={hip.x} y2={hip.y} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Hip to Lumbar */}
            <line x1={hip.x} y1={hip.y} x2={lumbar.x} y2={lumbar.y} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Lumbar to Shoulder */}
            <line x1={lumbar.x} y1={lumbar.y} x2={shoulder.x} y2={shoulder.y} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            {/* Shoulder to Wrist */}
            <line x1={shoulder.x} y1={shoulder.y} x2={wrist.x} y2={wrist.y} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />

            {/* Lumbar Lordosis Arch Offset Indicator */}
            {result.hasLumbarCheat && (
              <line
                x1="150"
                y1={lumbar.y}
                x2={lumbar.x}
                y2={lumbar.y}
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="2 2"
              />
            )}

            {/* Joints */}
            <circle cx={ankle.x} cy={ankle.y} r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={hip.x} cy={hip.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={lumbar.x} cy={lumbar.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={shoulder.x} cy={shoulder.y} r="7" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={wrist.x} cy={wrist.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />

            {/* Text Overlays */}
            <text x="162" y={ankle.y + 4} fill="#a1a1aa" fontSize="10" fontFamily="monospace">Ankles</text>
            <text x="162" y={hip.y + 4} fill="#a1a1aa" fontSize="10" fontFamily="monospace">Pelvis</text>
            <text x={lumbar.x > 150 ? lumbar.x + 8 : 162} y={lumbar.y + 4} fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
              Lumbar ({result.lumbarLordosisDeviationPx}px)
            </text>
            <text x="162" y={shoulder.y + 4} fill="#a1a1aa" fontSize="10" fontFamily="monospace">Shoulder</text>
            <text x="162" y={wristY + 4} fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">Hands / Wrist</text>
          </svg>

          {/* Measured Angle & Drag Penalty Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 font-mono text-right">
            <div className="bg-neutral-900 border border-white/20 px-3 py-1.5 rounded-lg">
              <span className="text-[10px] text-neutral-400 block uppercase">Flexion Reach</span>
              <span className="text-xl font-extrabold text-white">
                {result.overheadFlexionAngle}°
              </span>
            </div>
            {result.passiveDragPenaltyMultiplier > 1.0 && (
              <div className="bg-white text-black px-2.5 py-1 rounded-lg text-xs font-bold border border-white">
                +{Math.round((result.passiveDragPenaltyMultiplier - 1.0) * 100)}% Passive Drag
              </div>
            )}
          </div>
        </div>

        {/* Diagnostic Panel & Sliders */}
        <div className="space-y-4">
          <div className="space-y-3 p-4 rounded-xl bg-black border border-white/10">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-300 font-mono">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Overhead Reach Height:
                </span>
                <span className="text-white font-bold">{result.overheadFlexionAngle}°</span>
              </div>
              <input
                type="range"
                min="20"
                max="140"
                value={wristY}
                onChange={(e) => setWristY(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex justify-between text-xs text-neutral-300 font-mono">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Lumbar Arching (Compensatory Pelvic Tilt):
                </span>
                <span className="text-white font-bold">{result.lumbarLordosisDeviationPx} px</span>
              </div>
              <input
                type="range"
                min="150"
                max="185"
                value={lumbarArchX}
                onChange={(e) => setLumbarArchX(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>Neutral Spine (0px)</span>
                <span>Severe Lumbar Arch (+35px)</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Hydrodynamic Evaluation:
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {result.feedback}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
