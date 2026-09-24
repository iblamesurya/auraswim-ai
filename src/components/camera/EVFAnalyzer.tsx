import React, { useState } from 'react'
import { calculateEarlyVerticalForearm } from '../../lib/biomechanics/angleCalculators'
import type { Point2D } from '../../lib/biomechanics/angleCalculators'
import { Sparkles, AlertTriangle, CheckCircle2, Sliders, Upload } from 'lucide-react'

export const EVFAnalyzer: React.FC = () => {
  // Preset elbow position simulating catch angle
  const [elbowY, setElbowY] = useState(130) // Slider to simulate dropped vs high elbow
  const [videoFile, setVideoFile] = useState<string | null>(null)

  // Standard coordinates: Shoulder -> Elbow -> Wrist
  const shoulder: Point2D = { x: 70, y: 110 }
  const elbow: Point2D = { x: 160, y: elbowY }
  const wrist: Point2D = { x: 240, y: 190 }

  const evfResult = calculateEarlyVerticalForearm(shoulder, elbow, wrist)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setVideoFile(url)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Early Vertical Forearm (EVF) Catch Analyzer
          </h3>
          <p className="text-xs text-slate-400">
            Measures elbow catch angle ($\angle$ Shoulder - Elbow - Wrist). Optimal range is $100^\circ - 125^\circ$.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 cursor-pointer border border-slate-700 transition-colors">
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upload Stroke Video</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Visual Skeleton View / Video */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {videoFile ? (
            <video
              src={videoFile}
              controls
              loop
              className="w-full max-h-[280px] rounded-lg object-contain"
            />
          ) : (
            <svg
              viewBox="0 0 320 280"
              className="w-full max-w-[280px] h-[250px] overflow-visible"
            >
              {/* Water surface line */}
              <line
                x1="20"
                y1="70"
                x2="300"
                y2="70"
                stroke="#0284c7"
                strokeDasharray="6 4"
                strokeWidth="2"
              />
              <text x="25" y="60" fill="#38bdf8" fontSize="11" fontStyle="italic">
                Water Surface Level
              </text>

              {/* Upper Arm (Shoulder -> Elbow) */}
              <line
                x1={shoulder.x}
                y1={shoulder.y}
                x2={elbow.x}
                y2={elbow.y}
                stroke="#06b6d4"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Forearm (Elbow -> Wrist) */}
              <line
                x1={elbow.x}
                y1={elbow.y}
                x2={wrist.x}
                y2={wrist.y}
                stroke={
                  evfResult.status === 'optimal'
                    ? '#10b981'
                    : evfResult.status === 'acceptable'
                    ? '#f59e0b'
                    : '#ef4444'
                }
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Joints */}
              <circle cx={shoulder.x} cy={shoulder.y} r="8" fill="#0891b2" />
              <text x={shoulder.x - 10} y={shoulder.y - 12} fill="#e2e8f0" fontSize="11" fontWeight="bold">
                Shoulder
              </text>

              <circle
                cx={elbow.x}
                cy={elbow.y}
                r="10"
                fill={
                  evfResult.status === 'optimal'
                    ? '#10b981'
                    : evfResult.status === 'acceptable'
                    ? '#f59e0b'
                    : '#ef4444'
                }
              />
              <text x={elbow.x - 15} y={elbow.y + 25} fill="#f1f5f9" fontSize="12" fontWeight="bold">
                Elbow ({evfResult.angle}°)
              </text>

              <circle cx={wrist.x} cy={wrist.y} r="8" fill="#3b82f6" />
              <text x={wrist.x - 5} y={wrist.y + 20} fill="#94a3b8" fontSize="11">
                Fingertips/Wrist
              </text>
            </svg>
          )}

          <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
            {videoFile ? 'Video Analysis Mode' : 'Biomechanical Simulation Mode'}
          </div>
        </div>

        {/* Diagnosis and Sliders */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                Catch Elbow Flexion
              </span>
              <span className={`text-3xl font-extrabold ${evfResult.color}`}>
                {evfResult.angle}°
              </span>
            </div>

            <div className="flex items-center gap-2">
              {evfResult.status === 'optimal' ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>OPTIMAL EVF (High Elbow Anchor)</span>
                </div>
              ) : evfResult.status === 'acceptable' ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>ACCEPTABLE (Elbow Starting to Slide)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>DROPPED ELBOW (Propulsive Loss & Shoulder Stress)</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-sm leading-relaxed text-slate-300">
            <p>{evfResult.feedback}</p>
          </div>

          {/* Calibrate / Simulate Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Adjust Elbow Depth (Simulate Dropped vs High Elbow):
              </span>
              <span className="font-mono">{evfResult.angle}°</span>
            </div>
            <input
              type="range"
              min="90"
              max="165"
              value={elbowY}
              onChange={(e) => setElbowY(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>High Elbow Catch (105°)</span>
              <span>Flat/Dropped Elbow (155°)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
