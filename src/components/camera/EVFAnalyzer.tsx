import React, { useState } from 'react'
import { calculateEarlyVerticalForearm } from '../../lib/biomechanics/angleCalculators'
import type { Point2D } from '../../lib/biomechanics/angleCalculators'
import { Sparkles, Sliders, Upload, Info } from 'lucide-react'

export const EVFAnalyzer: React.FC = () => {
  const [elbowY, setElbowY] = useState(130)
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
    <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-5 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-white" />
            Early Vertical Forearm (EVF) Catch Analyzer
          </h3>
          <p className="text-xs text-neutral-400">
            Measures elbow catch angle ($\angle$ Shoulder - Elbow - Wrist). Optimal range is 100° - 125°.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-xs text-white cursor-pointer border border-white/20 transition-colors font-mono">
            <Upload className="w-3.5 h-3.5 text-white" />
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
        <div className="relative bg-black rounded-xl border border-white/10 p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {videoFile ? (
            <video
              src={videoFile}
              controls
              loop
              className="w-full max-h-[280px] rounded-lg object-contain"
            />
          ) : (
            <svg
              viewBox="0 0 320 260"
              className="w-full max-w-[280px] h-[240px] overflow-visible"
            >
              {/* Reference water surface line */}
              <line x1="20" y1="90" x2="300" y2="90" stroke="#262626" strokeWidth="2" strokeDasharray="4 4" />
              <text x="25" y="82" fill="#71717a" fontSize="10" fontFamily="monospace">Water Surface</text>

              {/* Arm Segments */}
              <line
                x1={shoulder.x}
                y1={shoulder.y}
                x2={elbow.x}
                y2={elbow.y}
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={elbow.x}
                y1={elbow.y}
                x2={wrist.x}
                y2={wrist.y}
                stroke="#ffffff"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Joints */}
              <circle cx={shoulder.x} cy={shoulder.y} r="7" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx={elbow.x} cy={elbow.y} r="8" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx={wrist.x} cy={wrist.y} r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />

              <text x={shoulder.x - 10} y={shoulder.y - 14} fill="#a1a1aa" fontSize="10" fontFamily="monospace">Shoulder</text>
              <text x={elbow.x - 5} y={elbowY - 14} fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="monospace">Elbow (EVF)</text>
              <text x={wrist.x - 5} y={wrist.y + 20} fill="#a1a1aa" fontSize="10" fontFamily="monospace">Fingertips / Catch</text>
            </svg>
          )}

          {/* Measured Catch Angle Badge */}
          <div className="absolute top-4 right-4 bg-neutral-900 border border-white/20 px-3 py-1.5 rounded-lg text-center font-mono">
            <span className="text-[10px] text-neutral-400 block uppercase">Catch Angle</span>
            <span className="text-xl font-extrabold text-white">
              {evfResult.angle}°
            </span>
          </div>
        </div>

        {/* Diagnosis & Adjustment Slider */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" />
                Adjust Elbow Depth (Simulation):
              </span>
              <span className="font-bold text-white">{evfResult.angle}°</span>
            </div>
            <input
              type="range"
              min="90"
              max="165"
              value={elbowY}
              onChange={(e) => setElbowY(Number(e.target.value))}
              className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>High Elbow (EVF Locked ~110°)</span>
              <span>Dropped Elbow (~150°)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Hydrodynamic Diagnosis:
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              {evfResult.feedback}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
