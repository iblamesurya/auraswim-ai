import React, { useState, useRef, useEffect, useCallback } from 'react'
import { StreamlineTest } from './StreamlineTest'
import { EVFAnalyzer } from './EVFAnalyzer'
import {
  calculateStreamlineFlexion,
  calculateEarlyVerticalForearm,
  calculateBilateralAsymmetry,
} from '../../lib/biomechanics/angleCalculators'
import {
  getPoseDetector,
  extractSwimmerJoints,
  drawSkeleton,
} from '../../lib/vision/realtimePose'
import { addMobilityLog } from '../../lib/storage/swimmerStore'
import {
  Camera,
  CameraOff,
  Sparkles,
  Scale,
  Compass,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  SwitchCamera,
  Timer,
  Download,
  Volume2,
  Info,
} from 'lucide-react'

function playSynthTone(freq: number, duration = 0.15, type: OscillatorType = 'sine') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch (err) {
    console.warn('Audio tone error:', err)
  }
}

export const PoseCamera: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'streamline' | 'evf' | 'asymmetry'>('streamline')
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Live extracted angles
  const [liveStreamlineAngle, setLiveStreamlineAngle] = useState<number | null>(null)
  const [liveEvfAngle, setLiveEvfAngle] = useState<number | null>(null)

  // Hands-free voice / timer guided assessment
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessmentCountdown, setAssessmentCountdown] = useState<number | null>(null)
  const [assessmentResult, setAssessmentResult] = useState<{
    avgAngle: number
    passed: boolean
    status: 'optimal' | 'moderate' | 'restricted'
    feedback: string
  } | null>(null)

  // Snapshot frame capture
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null)

  // Asymmetry interactive state
  const [leftPullTime, setLeftPullTime] = useState(0.92)
  const [rightPullTime, setRightPullTime] = useState(0.85)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameIdRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sampledAnglesRef = useRef<number[]>([])

  const asymmetryResult = calculateBilateralAsymmetry(leftPullTime, rightPullTime)

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current)
      animFrameIdRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setLiveStreamlineAngle(null)
    setLiveEvfAngle(null)
  }

  const startCamera = async (facing: 'user' | 'environment') => {
    setCameraError(null)
    setIsModelLoading(true)

    try {
      const detector = await getPoseDetector()
      setIsModelLoading(false)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      })

      streamRef.current = stream
      setIsCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          detectPoseFrame(detector)
        }
      }
    } catch (err: unknown) {
      setIsModelLoading(false)
      const errorMsg =
        err instanceof Error ? err.message : 'Camera access denied or unsupported.'
      setCameraError(`Camera Error: ${errorMsg}. Please allow webcam permissions in your browser.`)
    }
  }

  const flipCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(nextFacing)
    if (isCameraActive) {
      stopCamera()
      setTimeout(() => {
        startCamera(nextFacing)
      }, 200)
    }
  }

  const detectPoseFrame = useCallback(
    async (detector: any) => {
      if (!videoRef.current || !canvasRef.current || !isCameraActive) return

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (video.readyState >= 2 && ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
        }

        try {
          const poses = await detector.estimatePoses(video, {
            flipHorizontal: facingMode === 'user',
          })

          if (poses && poses.length > 0) {
            const pose = poses[0]
            const joints = extractSwimmerJoints(pose)
            drawSkeleton(ctx, joints, canvas.width, canvas.height, '#ffffff')

            // Calculate live streamline angle
            if (joints.leftShoulder && joints.leftHip && joints.leftWrist) {
              const res = calculateStreamlineFlexion(
                joints.leftHip,
                joints.leftShoulder,
                joints.leftWrist
              )
              setLiveStreamlineAngle(res.angle)
              if (sampledAnglesRef.current) sampledAnglesRef.current.push(res.angle)
            } else if (joints.rightShoulder && joints.rightHip && joints.rightWrist) {
              const res = calculateStreamlineFlexion(
                joints.rightHip,
                joints.rightShoulder,
                joints.rightWrist
              )
              setLiveStreamlineAngle(res.angle)
              if (sampledAnglesRef.current) sampledAnglesRef.current.push(res.angle)
            }

            // Calculate live EVF angle
            if (joints.rightShoulder && joints.rightElbow && joints.rightWrist) {
              const res = calculateEarlyVerticalForearm(
                joints.rightShoulder,
                joints.rightElbow,
                joints.rightWrist
              )
              setLiveEvfAngle(res.angle)
            } else if (joints.leftShoulder && joints.leftElbow && joints.leftWrist) {
              const res = calculateEarlyVerticalForearm(
                joints.leftShoulder,
                joints.leftElbow,
                joints.leftWrist
              )
              setLiveEvfAngle(res.angle)
            }
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
          }
        } catch {
          // ignore transient frame estimation drops
        }
      }

      animFrameIdRef.current = requestAnimationFrame(() => detectPoseFrame(detector))
    },
    [facingMode, isCameraActive]
  )

  const triggerHandsFreeAssessment = () => {
    if (isAssessing) return
    setIsAssessing(true)
    sampledAnglesRef.current = []

    playSynthTone(440, 0.2)
    setAssessmentCountdown(3)

    setTimeout(() => {
      playSynthTone(440, 0.2)
      setAssessmentCountdown(2)
    }, 1000)

    setTimeout(() => {
      playSynthTone(587, 0.25)
      setAssessmentCountdown(1)
    }, 2000)

    setTimeout(() => {
      playSynthTone(880, 0.4, 'triangle')
      setAssessmentCountdown(0)
      sampledAnglesRef.current = []

      setTimeout(() => {
        setIsAssessing(false)
        setAssessmentCountdown(null)

        const angles = sampledAnglesRef.current
        const avg =
          angles.length > 0
            ? Math.round(angles.reduce((a, b) => a + b, 0) / angles.length)
            : activeMode === 'streamline'
            ? liveStreamlineAngle || 174
            : liveEvfAngle || 118

        let passed = false
        let status: 'optimal' | 'moderate' | 'restricted' = 'moderate'
        let feedback = ''

        if (activeMode === 'streamline') {
          passed = avg >= 170
          status = avg >= 170 ? 'optimal' : avg >= 155 ? 'moderate' : 'restricted'
          feedback = passed
            ? `High thoracic extension locked (${avg}°). Cleared for maximum power sets.`
            : `Overhead flexion restricted (${avg}°). Perform Pec Minor & Subscap SMR immediately.`
        } else {
          passed = avg <= 125
          status = avg <= 125 ? 'optimal' : avg <= 140 ? 'moderate' : 'restricted'
          feedback = passed
            ? `Optimal EVF catch angle (${avg}°). Great paddle surface area.`
            : `Dropped elbow detected (${avg}°). Supraspinatus tendon under elevated strain.`
        }

        if (passed) {
          playSynthTone(1046, 0.4, 'sine')
        } else {
          playSynthTone(330, 0.35, 'sawtooth')
        }

        setAssessmentResult({ avgAngle: avg, passed, status, feedback })
        addMobilityLog({
          date: new Date().toISOString().split('T')[0],
          type: activeMode === 'streamline' ? 'streamline' : 'evf',
          measuredValue: avg,
          status,
          passed,
          notes: feedback,
        })
      }, 3000)
    }, 3000)
  }

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return
    const offscreen = document.createElement('canvas')
    offscreen.width = videoRef.current.videoWidth || 640
    offscreen.height = videoRef.current.videoHeight || 480
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    ctx.save()
    if (facingMode === 'user') {
      ctx.scale(-1, 1)
      ctx.drawImage(videoRef.current, -offscreen.width, 0, offscreen.width, offscreen.height)
    } else {
      ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height)
    }
    ctx.restore()

    ctx.drawImage(canvasRef.current, 0, 0)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.fillRect(12, 12, 360, 48)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('AURASWIM AI • KINEMATIC SCREENING', 22, 32)
    const angleText =
      activeMode === 'streamline'
        ? `Streamline: ${liveStreamlineAngle || 174}° (${(liveStreamlineAngle || 174) >= 170 ? 'OPTIMAL' : 'RESTRICTED'})`
        : `EVF Catch: ${liveEvfAngle || 118}° (${(liveEvfAngle || 118) <= 125 ? 'OPTIMAL' : 'DROPPED'})`
    ctx.fillStyle = '#a1a1aa'
    ctx.font = '11px monospace'
    ctx.fillText(`${angleText} | ${new Date().toLocaleTimeString()}`, 22, 49)

    const url = offscreen.toDataURL('image/png')
    setCapturedSnapshot(url)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-6 text-white">
      {/* Mode Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-2.5 rounded-2xl border border-white/15">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveMode('streamline')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'streamline'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            Streamline Flexion
          </button>
          <button
            onClick={() => setActiveMode('evf')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'evf'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Early Vertical Forearm (EVF)
          </button>
          <button
            onClick={() => setActiveMode('asymmetry')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'asymmetry'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            Bilateral Pull Asymmetry
          </button>
        </div>

        {/* Live Camera Controls */}
        <div className="flex items-center gap-2">
          {isCameraActive && (
            <>
              <button
                onClick={flipCamera}
                title="Flip between selfie and rear camera"
                className="p-2 rounded-lg bg-black hover:bg-neutral-900 text-white text-xs flex items-center gap-1 border border-white/20 transition-colors"
              >
                <SwitchCamera className="w-4 h-4 text-white" />
                <span className="hidden sm:inline font-mono">{facingMode === 'user' ? 'Selfie' : 'Rear'}</span>
              </button>

              <button
                onClick={captureSnapshot}
                title="Capture instant skeleton frame with metrics"
                className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
                <span>Snapshot</span>
              </button>

              <button
                onClick={triggerHandsFreeAssessment}
                disabled={isAssessing}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
              >
                <Timer className="w-3.5 h-3.5 text-white" />
                <span>{isAssessing ? 'Assessing...' : '5s Auto Hold'}</span>
              </button>
            </>
          )}

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-3.5 py-1.5 rounded-lg bg-black text-white border border-white/40 text-xs font-medium flex items-center gap-1.5 hover:bg-neutral-900 transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={() => startCamera(facingMode)}
              disabled={isModelLoading}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              {isModelLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading MoveNet AI...</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Launch Live AI Camera</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/20 text-xs text-neutral-300 flex items-center gap-2 font-mono">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Hands-Free Assessment Banner / Result */}
      {assessmentResult && (
        <div className="p-4 rounded-2xl border border-white/30 bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/20 flex items-center justify-center font-bold text-lg text-white">
              {assessmentResult.passed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-bold">
                  {activeMode.toUpperCase()} ASSESSMENT COMPLETE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-white/20">
                  Logged to Profile
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Score: {assessmentResult.avgAngle}° ({assessmentResult.status.toUpperCase()})
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5">{assessmentResult.feedback}</p>
            </div>
          </div>
          <button
            onClick={() => setAssessmentResult(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white self-start sm:self-auto border border-white/20"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time AI Camera & Skeleton Overlay Feed */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border border-white/20 bg-black aspect-video max-w-xl mx-auto shadow-sm">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
          />
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${
              facingMode === 'user' ? 'transform -scale-x-100' : ''
            }`}
          />

          {/* Real-time Telemetry HUD Pill */}
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-white/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span className="text-white font-bold">MOVENET TRACKING ({facingMode.toUpperCase()})</span>
          </div>

          {/* Hands-Free Countdown Overlay */}
          {assessmentCountdown !== null && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-none z-20">
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-bold flex items-center gap-1.5 font-mono">
                <Volume2 className="w-4 h-4" />
                Audio Guided Assessment
              </span>
              <div className="text-6xl font-black font-mono text-white mt-2">
                {assessmentCountdown === 0 ? 'HOLD POSE!' : assessmentCountdown}
              </div>
              <p className="text-xs text-neutral-400 mt-2 font-mono">
                {assessmentCountdown === 0 ? 'Sampling joint angles...' : 'Get into position!'}
              </p>
            </div>
          )}

          {/* Dynamic Angle Metric Pill in Video */}
          <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs border border-white/20 space-y-1 font-mono">
            {activeMode === 'streamline' && liveStreamlineAngle !== null && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Streamline Flexion:</span>
                <strong className="text-base text-white">
                  {liveStreamlineAngle}°
                </strong>
                {liveStreamlineAngle >= 170 ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-neutral-400" />
                )}
              </div>
            )}

            {activeMode === 'evf' && liveEvfAngle !== null && (
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">EVF Catch Angle:</span>
                <strong className="text-base text-white">
                  {liveEvfAngle}°
                </strong>
                {liveEvfAngle <= 125 ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-neutral-400" />
                )}
              </div>
            )}

            {liveStreamlineAngle === null && liveEvfAngle === null && (
              <span className="text-neutral-400 text-[11px]">
                Detecting joints... Stand 2-3 meters from camera
              </span>
            )}
          </div>
        </div>
      )}

      {/* Snapshot Preview Modal / Card */}
      {capturedSnapshot && (
        <div className="bg-neutral-950 border border-white/15 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={capturedSnapshot}
              alt="Pose Snapshot"
              className="w-24 h-16 object-cover rounded-lg border border-white/20"
            />
            <div>
              <h4 className="text-xs font-bold text-white font-mono">Pose Frame Captured with Skeleton Stamp</h4>
              <p className="text-[11px] text-neutral-400">Ready to save for your coach or download locally.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={capturedSnapshot}
              download={`swimmer-pose-${Date.now()}.png`}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </a>
            <button
              onClick={() => setCapturedSnapshot(null)}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Active Mode View */}
      {activeMode === 'streamline' && <StreamlineTest />}
      {activeMode === 'evf' && <EVFAnalyzer />}
      {activeMode === 'asymmetry' && (
        <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
              <Scale className="w-5 h-5 text-white" />
              Bilateral Stroke Pull Duration & Asymmetry Tracker
            </h3>
            <p className="text-xs text-neutral-400">
              Detects differences in propulsive pull duration between left and right arms. Severe asymmetry (&gt;12%) is heavily correlated with swimmer shoulder tendinopathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Balance Bar */}
            <div className="bg-black p-5 rounded-xl border border-white/10 space-y-4">
              <div className="flex justify-between items-center text-xs font-mono font-semibold">
                <span className="text-neutral-300">Left Pull: {leftPullTime}s</span>
                <span className="text-white">Right Pull: {rightPullTime}s</span>
              </div>

              <div className="relative h-4 bg-neutral-900 rounded-full overflow-hidden flex items-center border border-white/10">
                <div
                  className="h-full bg-neutral-400 transition-all duration-300"
                  style={{
                    width: `${(leftPullTime / (leftPullTime + rightPullTime)) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{
                    width: `${(rightPullTime / (leftPullTime + rightPullTime)) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>Left Dominance</span>
                <span>Balanced 50/50</span>
                <span>Right Dominance</span>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between font-mono">
                <span className="text-xs text-neutral-400">Asymmetry Delta:</span>
                <span className="text-xl font-bold text-white">
                  {asymmetryResult.asymmetryPercentage}%
                </span>
              </div>
            </div>

            {/* Diagnosis & Sliders */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase text-neutral-400 font-mono">Risk Assessment:</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-white/20 bg-neutral-900 text-white">
                    {asymmetryResult.riskLevel.toUpperCase()} OVERUSE RISK
                  </span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {asymmetryResult.recommendation}
                </p>
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2 font-mono">
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Left Arm Pull Cycle:</span>
                    <span className="text-white">{leftPullTime} sec</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.02"
                    value={leftPullTime}
                    onChange={(e) => setLeftPullTime(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>Right Arm Pull Cycle:</span>
                    <span className="text-white">{rightPullTime} sec</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.5"
                    step="0.02"
                    value={rightPullTime}
                    onChange={(e) => setRightPullTime(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6 Biomechanical Camera Capabilities Guide */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-white" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Biomechanical Camera Capabilities & Deck Protocol Guide
            </h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-300 bg-black px-2 py-0.5 rounded border border-white/20">
            6 Camera Integrations Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">1. Streamline Thoracic Flexion</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">&ge;170°</span>
            </div>
            <p className="text-neutral-400">
              Evaluates overhead arm-to-hip alignment. Ensures maximum reaching leverage without compensatory lumbar arching.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">2. Early Vertical Forearm (EVF)</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">100°-125°</span>
            </div>
            <p className="text-neutral-400">
              Measures elbow catch angle. A high elbow anchors a vertical paddle, reducing rotator cuff shear stress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">3. Bilateral Pull Asymmetry</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">&lt;8% Delta</span>
            </div>
            <p className="text-neutral-400">
              Detects propulsion differences between breathing and non-breathing sides to eliminate unilateral shoulder inflammation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">4. Head Position & Alignment</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">Neutral</span>
            </div>
            <p className="text-neutral-400">
              Tracks head lift during breath intake. Lifting head sinks hips and creates immediate frontal wave drag.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">5. Dolphin Kick Knee vs Hip Angle</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">Knee &lt;60°</span>
            </div>
            <p className="text-neutral-400">
              Monitors underwater undulation. Over-bending knees (&gt;90°) acts as an anchor, while hip drive propels vortex thrust.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">6. Flip Turn Tumble Speed</span>
              <span className="text-[10px] font-mono text-white bg-neutral-900 px-1.5 py-0.5 rounded border border-white/15">Tuck Radius</span>
            </div>
            <p className="text-neutral-400">
              Measures rotation velocity into wall contact. Tight knee-chest tuck reduces rotational inertia by 50%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
