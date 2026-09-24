import React, { useState } from 'react'
import { calculateStreamlineFlexion } from '../../lib/biomechanics/angleCalculators'
import type { Point2D } from '../../lib/biomechanics/angleCalculators'
import { ShieldAlert, Award, Info } from 'lucide-react'

export const StreamlineTest: React.FC = () => {
  // Preset or adjustable landmarks representing Hip -> Shoulder -> Wrist
  const [wristY, setWristY] = useState(40) // 0 to 100

  // Standard points on canvas (width 300, height 360)
  const hip: Point2D = { x: 150, y: 320 }
  const shoulder: Point2D = { x: 150, y: 180 }
  const wrist: Point2D = { x: 150, y: wristY }

  const result = calculateStreamlineFlexion(hip, shoulder, wrist)

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Streamline & Shoulder Flexion Test
          </h3>
          <p className="text-xs text-slate-400">
            Measures active overhead shoulder flexion angle ($180^\circ$ is full vertical streamline)
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            result.status === 'excellent'
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700'
              : result.status === 'adequate'
              ? 'bg-amber-950/80 text-amber-400 border border-amber-700'
              : 'bg-rose-950/80 text-rose-400 border border-rose-700'
          }`}
        >
          {result.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Pose Canvas */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[340px]">
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
              stroke="#1e293b"
              strokeDasharray="4 4"
            />

            {/* Torso & Arm Skeleton Lines */}
            <line
              x1={hip.x}
              y1={hip.y}
              x2={shoulder.x}
              y2={shoulder.y}
              stroke="#38bdf8"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1={shoulder.x}
              y1={shoulder.y}
              x2={wrist.x}
              y2={wrist.y}
              stroke={
                result.status === 'excellent'
                  ? '#34d399'
                  : result.status === 'adequate'
                  ? '#fbbf24'
                  : '#f87171'
              }
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Joint Nodes */}
            <circle cx={hip.x} cy={hip.y} r="8" fill="#0284c7" />
            <text x={hip.x + 15} y={hip.y + 5} fill="#94a3b8" fontSize="11">
              Hip
            </text>

            <circle cx={shoulder.x} cy={shoulder.y} r="10" fill="#38bdf8" />
            <text
              x={shoulder.x + 15}
              y={shoulder.y + 5}
              fill="#e2e8f0"
              fontSize="12"
              fontWeight="bold"
            >
              Shoulder ({result.angle}°)
            </text>

            <circle
              cx={wrist.x}
              cy={wrist.y}
              r="8"
              fill={
                result.status === 'excellent'
                  ? '#34d399'
                  : result.status === 'adequate'
                  ? '#fbbf24'
                  : '#f87171'
              }
            />
            <text x={wrist.x + 15} y={wrist.y + 5} fill="#94a3b8" fontSize="11">
              Wrist / Hands
            </text>

            {/* Head Silhouette */}
            <circle cx="150" cy="140" r="16" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          </svg>

          <div className="absolute bottom-2 left-2 text-[10px] text-slate-500">
            Interactive Biomechanical Landmark Map
          </div>
        </div>

        {/* Diagnosis & Controls */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                Flexion Angle
              </span>
              <span className="text-3xl font-extrabold text-white">
                {result.angle}°
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  result.alignmentScore >= 85
                    ? 'bg-emerald-400'
                    : result.alignmentScore >= 65
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${result.alignmentScore}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Mobility Score: {result.alignmentScore}/100</span>
              <span>Target: 175° - 180°</span>
            </div>
          </div>

          {/* Feedback Card */}
          <div
            className={`p-4 rounded-xl border text-sm leading-relaxed ${
              result.status === 'excellent'
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                : result.status === 'adequate'
                ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{result.feedback}</p>
              </div>
            </div>
          </div>

          {/* Interactive Calibration Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Simulate Shoulder Reach / Arm Angle:</span>
              <span className="font-mono">{result.angle}°</span>
            </div>
            <input
              type="range"
              min="30"
              max="130"
              value={wristY}
              onChange={(e) => setWristY(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Restricted Overhead (&lt;155°)</span>
              <span>Full Streamline (180°)</span>
            </div>
          </div>

          {result.status === 'restricted' && (
            <div className="p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg flex items-center gap-2 text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>
                Recommended: Perform <strong>Pec Minor SMR</strong> with lacrosse ball before swimming.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
