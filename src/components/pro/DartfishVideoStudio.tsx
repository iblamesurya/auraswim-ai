import React, { useState, useRef, useEffect } from 'react'
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Gauge,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export const DartfishVideoStudio: React.FC = () => {
  // Video streams / sources
  const [videoASrc, setVideoASrc] = useState<string | null>(null)
  const [videoBSrc, setVideoBSrc] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackRate, setPlaybackRate] = useState<number>(0.5) // Default 0.5x slow motion
  const [splitViewMode, setSplitViewMode] = useState<'side-by-side' | 'single'>('side-by-side')

  const videoARef = useRef<HTMLVideoElement | null>(null)
  const videoBRef = useRef<HTMLVideoElement | null>(null)

  // 3-Stroke Cadence Tap Tool
  const [tapTimes, setTapTimes] = useState<number[]>([])
  const [calculatedSpm, setCalculatedSpm] = useState<number | null>(null)
  const [tapInstruction, setTapInstruction] = useState('Tap 3 times on consecutive hand entries')

  // Independent Track B Slip / Offset (for locking hand entries between two clips)
  const [trackBOffsetFrames, setTrackBOffsetFrames] = useState<number>(0)

  const nudgeTrackB = (frames: number) => {
    setTrackBOffsetFrames((prev) => prev + frames)
    if (videoBRef.current) {
      const delta = (1 / 30) * frames
      videoBRef.current.currentTime = Math.max(0, videoBRef.current.currentTime + delta)
    }
  }

  // Angle Caliper Overlay State
  const [caliperPoints, setCaliperPoints] = useState<Array<{ x: number; y: number }>>([])
  const [measuredAngle, setMeasuredAngle] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Synchronized playback controls
  const handleTogglePlay = () => {
    if (isPlaying) {
      videoARef.current?.pause()
      videoBRef.current?.pause()
      setIsPlaying(false)
    } else {
      videoARef.current?.play()
      videoBRef.current?.play()
      setIsPlaying(true)
    }
  }

  const handleReset = () => {
    if (videoARef.current) videoARef.current.currentTime = 0
    if (videoBRef.current) videoBRef.current.currentTime = 0
  }

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
    if (videoARef.current) videoARef.current.playbackRate = rate
    if (videoBRef.current) videoBRef.current.playbackRate = rate
  }

  const stepFrame = (frames: number) => {
    const delta = (1 / 30) * frames // Assuming 30fps
    if (videoARef.current) {
      videoARef.current.pause()
      videoARef.current.currentTime = Math.max(0, videoARef.current.currentTime + delta)
    }
    if (videoBRef.current) {
      videoBRef.current.pause()
      videoBRef.current.currentTime = Math.max(0, videoBRef.current.currentTime + delta)
    }
    setIsPlaying(false)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'A' | 'B') => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      if (slot === 'A') setVideoASrc(url)
      else setVideoBSrc(url)
    }
  }

  // 3-Stroke Cadence Tap Logic
  const handleCadenceTap = () => {
    const now = performance.now()
    const updated = [...tapTimes, now]

    if (updated.length === 1) {
      setTapTimes(updated)
      setTapInstruction('Tap 2 more times (next hand entry)...')
    } else if (updated.length === 2) {
      setTapTimes(updated)
      setTapInstruction('Tap 1 last time for exact SPM...')
    } else if (updated.length >= 3) {
      const t0 = updated[0]
      const t2 = updated[updated.length - 1]
      const durationSeconds = (t2 - t0) / 1000

      // In competitive swimming (FINA / USA Swimming standard):
      // Stroke Rate (SPM) = (3 * 60) / durationSeconds
      const spm = Math.round((3 * 60) / durationSeconds)
      setCalculatedSpm(spm)
      setTapTimes([])
      setTapInstruction('Tapped 3 strokes! Tap again to measure new interval.')
    }
  }

  const resetCadence = () => {
    setTapTimes([])
    setCalculatedSpm(null)
    setTapInstruction('Tap 3 times on consecutive hand entries')
  }

  // Angle Caliper Click Logic
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newPoints = [...caliperPoints, { x, y }]
    if (newPoints.length === 3) {
      const [p1, p2, p3] = newPoints
      const v1 = { x: p1.x - p2.x, y: p1.y - p2.y }
      const v2 = { x: p3.x - p2.x, y: p3.y - p2.y }
      const dot = v1.x * v2.x + v1.y * v2.y
      const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y)
      const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y)
      if (mag1 * mag2 > 0) {
        const rad = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))))
        const deg = Math.round((rad * 180) / Math.PI)
        setMeasuredAngle(deg)
      }
      setCaliperPoints(newPoints)
    } else if (newPoints.length > 3) {
      setCaliperPoints([{ x, y }])
      setMeasuredAngle(null)
    } else {
      setCaliperPoints(newPoints)
    }
  }

  const clearCaliper = () => {
    setCaliperPoints([])
    setMeasuredAngle(null)
  }

  // Redraw caliper canvas in pure white
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (caliperPoints.length > 0) {
      ctx.lineWidth = 2.5
      ctx.strokeStyle = '#ffffff'
      ctx.fillStyle = '#ffffff'

      caliperPoints.forEach((p, i) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 11px monospace'
        ctx.fillText(`P${i + 1}`, p.x + 8, p.y - 8)
      })

      if (caliperPoints.length >= 2) {
        ctx.beginPath()
        ctx.moveTo(caliperPoints[0].x, caliperPoints[0].y)
        ctx.lineTo(caliperPoints[1].x, caliperPoints[1].y)
        ctx.stroke()
      }

      if (caliperPoints.length === 3) {
        ctx.beginPath()
        ctx.moveTo(caliperPoints[1].x, caliperPoints[1].y)
        ctx.lineTo(caliperPoints[2].x, caliperPoints[2].y)
        ctx.stroke()

        if (measuredAngle !== null) {
          const midX = caliperPoints[1].x + 12
          const midY = caliperPoints[1].y - 12
          ctx.fillStyle = '#ffffff'
          ctx.font = 'bold 15px monospace'
          ctx.fillText(`${measuredAngle}°`, midX, midY)
        }
      }
    }
  }, [caliperPoints, measuredAngle])

  return (
    <div className="space-y-6 text-white">
      {/* Header Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              DARTFISH & KINOVEA SUITE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <Video className="w-5 h-5 text-white" />
              Dual-Video Kinematic Synchronizer & Slow-Mo Studio
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Professional frame-by-frame analysis with synchronized side-by-side playback, 0.1x slow motion, 3-stroke cadence tap counter, and on-video angle calipers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitViewMode(splitViewMode === 'side-by-side' ? 'single' : 'side-by-side')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black border border-white/20 text-xs font-mono text-neutral-300 hover:text-white"
            >
              {splitViewMode === 'side-by-side' ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{splitViewMode === 'side-by-side' ? 'Single View' : 'Dual Compare'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Viewport Grid */}
      <div className={`grid gap-4 ${splitViewMode === 'side-by-side' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Video Slot A (Primary / Underwater / Current) */}
        <div className="bg-neutral-950 border border-white/15 rounded-2xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span className="text-xs font-mono font-bold uppercase text-white">Video A (Primary / Catch)</span>
            </div>
            <label className="cursor-pointer text-xs font-mono px-2.5 py-1 rounded-lg bg-black border border-white/20 hover:border-white text-white flex items-center gap-1.5 transition-colors">
              <Upload className="w-3 h-3" />
              <span>Upload Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e, 'A')}
                className="hidden"
              />
            </label>
          </div>

          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
            {videoASrc ? (
              <>
                <video
                  ref={videoARef}
                  src={videoASrc}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  muted
                />
                {/* Canvas Overlay for Caliper */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={360}
                  onClick={handleCanvasClick}
                  className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                />
              </>
            ) : (
              <div className="text-center p-6 space-y-2">
                <Video className="w-10 h-10 text-neutral-600 mx-auto" />
                <p className="text-xs font-mono text-neutral-400">Upload Sister's Freestyle / Butterfly Clip</p>
                <p className="text-[11px] text-neutral-500">Supports .mp4, .mov, 60fps / 120fps slow-mo</p>
              </div>
            )}

            {measuredAngle !== null && (
              <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-black/90 border border-white/30 font-mono text-xs text-white">
                Caliper Angle: <strong>{measuredAngle}°</strong>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Click 3 points on video to measure EVF Catch or Body Angle</span>
            {caliperPoints.length > 0 && (
              <button
                onClick={clearCaliper}
                className="text-neutral-300 hover:text-white underline text-[11px]"
              >
                Clear Points ({caliperPoints.length}/3)
              </button>
            )}
          </div>
        </div>

        {/* Video Slot B (Comparison / Olympian Benchmark / Past Set) */}
        {splitViewMode === 'side-by-side' && (
          <div className="bg-neutral-950 border border-white/15 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
                <span className="text-xs font-mono font-bold uppercase text-neutral-300">
                  Video B (Benchmark / Comparison)
                </span>
              </div>
              <label className="cursor-pointer text-xs font-mono px-2.5 py-1 rounded-lg bg-black border border-white/20 hover:border-white text-white flex items-center gap-1.5 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload Benchmark</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleVideoUpload(e, 'B')}
                  className="hidden"
                />
              </label>
            </div>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
              {videoBSrc ? (
                <video
                  ref={videoBRef}
                  src={videoBSrc}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  muted
                />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <Video className="w-10 h-10 text-neutral-600 mx-auto" />
                  <p className="text-xs font-mono text-neutral-400">Upload Benchmark / Previous Meet Clip</p>
                  <p className="text-[11px] text-neutral-500">Synchronize side-by-side to detect technical drift</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Synchronized scrubber controls both streams concurrently</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Console (Playback, Speed, Frame Stepper, 3-Stroke Cadence) */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Synchronized Playback & Scrubbing */}
          <div className="md:col-span-6 space-y-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 block">
              Synchronized Transport Controls
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Sync Play'}</span>
              </button>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl bg-black border border-white/20 text-neutral-300 hover:text-white transition-colors"
                title="Reset to 0:00"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => stepFrame(-1)}
                className="px-2.5 py-1.5 rounded-lg bg-black border border-white/20 text-xs font-mono text-neutral-300 hover:text-white"
              >
                -1 Frame
              </button>
              <button
                onClick={() => stepFrame(1)}
                className="px-2.5 py-1.5 rounded-lg bg-black border border-white/20 text-xs font-mono text-neutral-300 hover:text-white"
              >
                +1 Frame
              </button>
            </div>

            {/* Playback Speeds */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] font-mono text-neutral-400 mr-2">Slow-Mo:</span>
              {[0.1, 0.25, 0.5, 0.75, 1.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSpeedChange(rate)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono border transition-all ${
                    playbackRate === rate
                      ? 'bg-white text-black border-white font-bold'
                      : 'bg-black text-neutral-400 border-white/15 hover:border-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Independent Track B Sync Slip (Biomechanic Hand Entry Lock) */}
            {splitViewMode === 'side-by-side' && (
              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Track B Slip (Lock Hand Entry):</span>
                  <span className="text-white font-bold">
                    {trackBOffsetFrames > 0 ? `+${trackBOffsetFrames}` : trackBOffsetFrames} Frames
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <button
                    onClick={() => nudgeTrackB(-5)}
                    className="px-2 py-1 rounded bg-black border border-white/20 text-xs text-neutral-300 hover:text-white"
                  >
                    -5 Fr
                  </button>
                  <button
                    onClick={() => nudgeTrackB(-1)}
                    className="px-2 py-1 rounded bg-black border border-white/20 text-xs text-neutral-300 hover:text-white"
                  >
                    -1 Fr
                  </button>
                  <button
                    onClick={() => setTrackBOffsetFrames(0)}
                    className="px-2 py-1 rounded bg-black border border-white/15 text-xs text-neutral-400 hover:text-white"
                  >
                    Reset Slip
                  </button>
                  <button
                    onClick={() => nudgeTrackB(1)}
                    className="px-2 py-1 rounded bg-black border border-white/20 text-xs text-neutral-300 hover:text-white"
                  >
                    +1 Fr
                  </button>
                  <button
                    onClick={() => nudgeTrackB(5)}
                    className="px-2 py-1 rounded bg-black border border-white/20 text-xs text-neutral-300 hover:text-white"
                  >
                    +5 Fr
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3-Stroke Cadence Tap Counter (Deck Tool) */}
          <div className="md:col-span-6 bg-black p-4 rounded-xl border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-white" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                  3-Stroke Cadence Tap Counter
                </span>
              </div>
              {calculatedSpm !== null && (
                <button
                  onClick={resetCadence}
                  className="text-[10px] font-mono text-neutral-400 hover:text-white underline"
                >
                  Reset
                </button>
              )}
            </div>

            <p className="text-[11px] text-neutral-400">
              Gold standard Olympic deck method: Tap on hand entry 1, entry 2, and entry 3 to compute instantaneous stroke rate.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCadenceTap}
                className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
              >
                {tapTimes.length === 0 ? 'Tap Hand Entry' : `Tap Cycle (${tapTimes.length}/3)`}
              </button>

              <div className="px-4 py-2 rounded-xl bg-neutral-950 border border-white/20 text-center min-w-[90px]">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Cadence</span>
                <span className="text-xl font-bold font-mono text-white">
                  {calculatedSpm !== null ? `${calculatedSpm} spm` : '--'}
                </span>
              </div>
            </div>

            <p className="text-[10px] font-mono text-neutral-400 italic">
              {tapInstruction}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
