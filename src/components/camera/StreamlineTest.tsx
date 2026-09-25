import React, { useState } from 'react'
import { calculateStreamlineFlexion } from '../../lib/biomechanics/angleCalculators'
import type { Point2D } from '../../lib/biomechanics/angleCalculators'
import { Award, Info } from 'lucide-react'

export const StreamlineTest: React.FC = () => {
  const [wristY, setWristY] = useState(40) // 0 to 100

  // Standard points on canvas (width 300, height 360)
  const hip: Point2D = { x: 150, y: 320 }
  const shoulder: Point2D = { x: 150, y: 180 }
  const wrist: Point2D = { x: 150, y: wristY }

  const result = calculateStreamlineFlexion(hip, shoulder, wrist)

  return (
    <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm text-white space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Award className="w-5 h-5 text-white" />
            Streamline & Shoulder Flexion Test
          </h3>
          <p className="text-xs text-neutral-400">
            Measures active overhead shoulder flexion angle (180° is full vertical streamline)
          </p>
        </div>
        <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg border border-white/20 bg-black text-white">
          {result.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Pose Canvas */}
        <div className="relative bg-black rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center min-h-[340px]">
          <svg
            viewBox="0 0 300 360"
            className="w-full max-w-[260px] h-[300px] overflow-visible"
          >
            {/* Background reference grid */}
            <line
              x1="150"
              y1="20"
              x2="150"
              y2="340"
              stroke="#262626"
              strokeDasharray="4 4"
            />

            {/* Torso & Arm Skeleton Lines */}
            <line
              x1={hip.x}
              y1={hip.y}
              x2={shoulder.x}
              y2={shoulder.y}
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={shoulder.x}
              y1={shoulder.y}
              x2={wrist.x}
              y2={wrist.y}
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Joint Markers */}
            <circle cx={hip.x} cy={hip.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={shoulder.x} cy={shoulder.y} r="8" fill="#ffffff" stroke="#000000" strokeWidth="2" />
            <circle cx={wrist.x} cy={wrist.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />

            {/* Text Overlay */}
            <text x="165" y="325" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Hip</text>
            <text x="165" y="185" fill="#a1a1aa" fontSize="10" fontFamily="monospace">Shoulder (Pivot)</text>
            <text x="165" y={wristY + 5} fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">Hands / Wrist</text>
          </svg>

          {/* Measured Angle Overlay */}
          <div className="absolute top-4 right-4 bg-neutral-900 border border-white/20 px-3 py-1.5 rounded-lg text-center font-mono">
            <span className="text-[10px] text-neutral-400 block uppercase">Flexion Angle</span>
            <span className="text-xl font-extrabold text-white">
              {result.angle}°
            </span>
          </div>
        </div>

        {/* Diagnostic Panel & Slider */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span>Simulate Reach Height:</span>
              <span className="text-white font-bold">{result.angle}°</span>
            </div>
            <input
              type="range"
              min="20"
              max="160"
              value={wristY}
              onChange={(e) => setWristY(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>Full Vertical Reach (180°)</span>
              <span>Restricted Reach (120°)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Kinematic Evaluation:
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
