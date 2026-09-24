import React, { useState, useRef, useEffect } from 'react'
import { StreamlineTest } from './StreamlineTest'
import { EVFAnalyzer } from './EVFAnalyzer'
import { calculateBilateralAsymmetry } from '../../lib/biomechanics/angleCalculators'
import { Camera, CameraOff, Sparkles, Scale, Compass } from 'lucide-react'

export const PoseCamera: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'streamline' | 'evf' | 'asymmetry'>('streamline')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Asymmetry state
  const [leftPullTime, setLeftPullTime] = useState(1.05)
  const [rightPullTime, setRightPullTime] = useState(0.92)

  const asymmetryResult = calculateBilateralAsymmetry(leftPullTime, rightPullTime)

  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsCameraActive(true)
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err)
      setCameraError('Camera access unavailable. Using high-precision interactive simulation mode.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveMode('streamline')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'streamline'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            Streamline & Thoracic Flexion
          </button>
          <button
            onClick={() => setActiveMode('evf')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'evf'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Early Vertical Forearm (EVF)
          </button>
          <button
            onClick={() => setActiveMode('asymmetry')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'asymmetry'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            Bilateral Pull Asymmetry
          </button>
        </div>

        {/* Live Camera Button */}
        <div>
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-medium flex items-center gap-1.5 hover:bg-rose-900 transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Turn Off Camera
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              Enable Live Webcam
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{cameraError}</span>
        </div>
      )}

      {/* Live Webcam Feed Overlay when active */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-black aspect-video max-w-lg mx-auto shadow-2xl">
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          {/* Animated Scanner Grid */}
          <div className="absolute inset-0 border-2 border-cyan-500/30 pointer-events-none">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute animate-scanline"></div>
          </div>
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-400 border border-cyan-800/50 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            LIVE VISION TRACKING
          </div>
        </div>
      )}

      {/* Active Mode View */}
      {activeMode === 'streamline' && <StreamlineTest />}
      {activeMode === 'evf' && <EVFAnalyzer />}
      {activeMode === 'asymmetry' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              Bilateral Stroke Pull Duration & Asymmetry Tracker
            </h3>
            <p className="text-xs text-slate-400">
              Detects differences in propulsive pull duration between left and right arms. Severe asymmetry (&gt;12%) is heavily correlated with swimmer shoulder tendinopathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Balance Bar */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-sky-400">Left Arm Pull: {leftPullTime}s</span>
                <span className="text-cyan-400">Right Arm Pull: {rightPullTime}s</span>
              </div>

              <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden flex items-center">
                <div
                  className="h-full bg-sky-500 transition-all duration-300"
                  style={{
                    width: `${(leftPullTime / (leftPullTime + rightPullTime)) * 100}%`,
                  }}
                ></div>
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{
                    width: `${(rightPullTime / (leftPullTime + rightPullTime)) * 100}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Left Dominance</span>
                <span>Balanced 50/50</span>
                <span>Right Dominance</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Asymmetry Delta:</span>
                <span className={`text-xl font-bold ${
                  asymmetryResult.riskLevel === 'low'
                    ? 'text-emerald-400'
                    : asymmetryResult.riskLevel === 'moderate'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}>
                  {asymmetryResult.asymmetryPercentage}%
                </span>
              </div>
            </div>

            {/* Diagnosis & Sliders */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-slate-400">Risk Assessment:</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    asymmetryResult.riskLevel === 'low'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : asymmetryResult.riskLevel === 'moderate'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {asymmetryResult.riskLevel.toUpperCase()} OVERUSE RISK
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {asymmetryResult.recommendation}
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Left Arm Pull Cycle:</span>
                    <span className="font-mono text-sky-400">{leftPullTime} sec</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.02"
                    value={leftPullTime}
                    onChange={(e) => setLeftPullTime(Number(e.target.value))}
                    className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Right Arm Pull Cycle:</span>
                    <span className="font-mono text-cyan-400">{rightPullTime} sec</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.02"
                    value={rightPullTime}
                    onChange={(e) => setRightPullTime(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
