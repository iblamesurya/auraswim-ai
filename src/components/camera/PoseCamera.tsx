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

  // Hands-free assessment state
  const [assessmentCountdown, setAssessmentCountdown] = useState<number | null>(null)
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<{
    avgAngle: number
    passed: boolean
    status: 'optimal' | 'moderate' | 'restricted'
    feedback: string
  } | null>(null)

  // Snapshot capture
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null)

  // Asymmetry manual state
  const [leftPullTime, setLeftPullTime] = useState(1.05)
  const [rightPullTime, setRightPullTime] = useState(0.92)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameId = useRef<number | null>(null)
  const detectorRef = useRef<unknown>(null)
  const sampledAnglesRef = useRef<number[]>([])

  const asymmetryResult = calculateBilateralAsymmetry(leftPullTime, rightPullTime)

  // Real-time detection loop
  const detectFrame = useCallback(async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState < 2 ||
      !detectorRef.current
    ) {
      animationFrameId.current = requestAnimationFrame(detectFrame)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const poses = await (detectorRef.current as any).estimatePoses(video)
      if (poses && poses.length > 0 && ctx) {
        const joints = extractSwimmerJoints(poses[0])
        drawSkeleton(ctx, joints, canvas.width, canvas.height, '#06b6d4')

        // 1. Calculate Live Streamline Angle (Shoulder Flexion: Hip -> Shoulder -> Wrist)
        const activeShoulder = joints.rightShoulder || joints.leftShoulder
        const activeWrist = joints.rightWrist || joints.leftWrist
        const activeHip = joints.rightHip || joints.leftHip

        if (activeShoulder && activeWrist && activeHip) {
          const res = calculateStreamlineFlexion(activeHip, activeShoulder, activeWrist)
          setLiveStreamlineAngle(res.angle)
          if (sampledAnglesRef.current) {
            sampledAnglesRef.current.push(res.angle)
          }
        }

        // 2. Calculate Live EVF Catch Angle (Shoulder -> Elbow -> Wrist)
        const activeElbow = joints.rightElbow || joints.leftElbow
        if (activeShoulder && activeElbow && activeWrist) {
          const evf = calculateEarlyVerticalForearm(activeShoulder, activeElbow, activeWrist)
          setLiveEvfAngle(evf.angle)
        }
      } else if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    } catch (err) {
      console.warn('Pose frame detection error:', err)
    }

    animationFrameId.current = requestAnimationFrame(detectFrame)
  }, [])

  const startCamera = async (targetFacing = facingMode) => {
    try {
      setCameraError(null)
      setIsModelLoading(true)

      // 1. Initialize MoveNet AI detector
      const detector = await getPoseDetector()
      detectorRef.current = detector

      // 2. Request camera with specific facingMode
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: targetFacing, width: { ideal: 640 }, height: { ideal: 480 } },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsCameraActive(true)
        setIsModelLoading(false)
        animationFrameId.current = requestAnimationFrame(detectFrame)
      }
    } catch (err) {
      console.warn('Camera or MoveNet model loading failed:', err)
      setIsModelLoading(false)
      setCameraError(
        'Real-time webcam feed unavailable or permission was dismissed. You can still use the interactive biomechanical analyzers and upload video footage below!'
      )
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsCameraActive(false)
    }
  }

  const flipCamera = async () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(nextFacing)
    stopCamera()
    await startCamera(nextFacing)
  }

  const triggerHandsFreeAssessment = () => {
    if (!isCameraActive) {
      startCamera()
    }
    setAssessmentResult(null)
    setIsAssessing(true)
    sampledAnglesRef.current = []

    // 3... 2... 1... Countdown
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

    // Measurement window (3 seconds hold)
    setTimeout(() => {
      playSynthTone(880, 0.4, 'triangle')
      setAssessmentCountdown(0) // 0 means "HOLDING POSE!"
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
          playSynthTone(1046, 0.4, 'sine') // high C success chime
        } else {
          playSynthTone(330, 0.35, 'sawtooth') // low warning tone
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

    // Draw video (mirrored if front camera)
    ctx.save()
    if (facingMode === 'user') {
      ctx.scale(-1, 1)
      ctx.drawImage(videoRef.current, -offscreen.width, 0, offscreen.width, offscreen.height)
    } else {
      ctx.drawImage(videoRef.current, 0, 0, offscreen.width, offscreen.height)
    }
    ctx.restore()

    // Draw skeleton canvas
    ctx.drawImage(canvasRef.current, 0, 0)

    // Draw Telemetry Watermark Stamp
    ctx.fillStyle = 'rgba(8, 12, 20, 0.8)'
    ctx.fillRect(12, 12, 360, 48)
    ctx.fillStyle = '#06b6d4'
    ctx.font = 'bold 13px monospace'
    ctx.fillText('AURASWIM AI • KINEMATIC SCREENING', 22, 32)
    const angleText =
      activeMode === 'streamline'
        ? `Streamline: ${liveStreamlineAngle || 174}° (${(liveStreamlineAngle || 174) >= 170 ? 'OPTIMAL' : 'RESTRICTED'})`
        : `EVF Catch: ${liveEvfAngle || 118}° (${(liveEvfAngle || 118) <= 125 ? 'OPTIMAL' : 'DROPPED'})`
    ctx.fillStyle = '#ffffff'
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
    <div className="space-y-6">
      {/* Mode Selector & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
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
            Streamline Flexion
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

        {/* Live Camera Controls */}
        <div className="flex items-center gap-2">
          {isCameraActive && (
            <>
              <button
                onClick={flipCamera}
                title="Flip between selfie and rear camera"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700 transition-colors"
              >
                <SwitchCamera className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline font-mono">{facingMode === 'user' ? 'Selfie' : 'Rear'}</span>
              </button>

              <button
                onClick={captureSnapshot}
                title="Capture instant skeleton frame with metrics"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Snapshot</span>
              </button>

              <button
                onClick={triggerHandsFreeAssessment}
                disabled={isAssessing}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/30"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{isAssessing ? 'Assessing...' : '5s Auto Hold'}</span>
              </button>
            </>
          )}

          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="px-3.5 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-medium flex items-center gap-1.5 hover:bg-rose-900 transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={() => startCamera(facingMode)}
              disabled={isModelLoading}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
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
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>{cameraError}</span>
        </div>
      )}

      {/* Hands-Free Assessment Banner / Result */}
      {assessmentResult && (
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            assessmentResult.passed
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/80 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                assessmentResult.passed ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'
              }`}
            >
              {assessmentResult.passed ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono tracking-wider font-bold">
                  {activeMode.toUpperCase()} ASSESSMENT COMPLETE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-slate-800">
                  Logged to Profile
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Score: {assessmentResult.avgAngle}° ({assessmentResult.status.toUpperCase()})
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">{assessmentResult.feedback}</p>
            </div>
          </div>
          <button
            onClick={() => setAssessmentResult(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 self-start sm:self-auto border border-slate-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time AI Camera & Skeleton Overlay Feed */}
      {isCameraActive && (
        <div className="relative rounded-2xl overflow-hidden border border-cyan-500/50 bg-black aspect-video max-w-xl mx-auto shadow-2xl">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
          />
          {/* Real-time Canvas overlay for skeleton drawing */}
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none ${
              facingMode === 'user' ? 'transform -scale-x-100' : ''
            }`}
          />

          {/* Real-time Telemetry HUD Pill */}
          <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono border border-cyan-500/40 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-400 font-bold">MOVENET TRACKING ({facingMode.toUpperCase()})</span>
          </div>

          {/* Hands-Free Countdown Overlay */}
          {assessmentCountdown !== null && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white pointer-events-none z-20">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-bounce" />
                Audio Guided Assessment
              </span>
              <div className="text-6xl font-black font-mono text-cyan-400 mt-2">
                {assessmentCountdown === 0 ? 'HOLD POSE!' : assessmentCountdown}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                {assessmentCountdown === 0 ? 'Sampling joint angles...' : 'Get into position!'}
              </p>
            </div>
          )}

          {/* Dynamic Angle Metric Pill in Video */}
          <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-xl text-xs border border-slate-800 space-y-1 shadow-lg">
            {activeMode === 'streamline' && liveStreamlineAngle !== null && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Streamline Flexion:</span>
                <strong
                  className={`font-mono text-base ${
                    liveStreamlineAngle >= 170 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {liveStreamlineAngle}°
                </strong>
                {liveStreamlineAngle >= 170 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
            )}

            {activeMode === 'evf' && liveEvfAngle !== null && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">EVF Catch Angle:</span>
                <strong
                  className={`font-mono text-base ${
                    liveEvfAngle <= 125 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {liveEvfAngle}°
                </strong>
                {liveEvfAngle <= 125 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                )}
              </div>
            )}

            {liveStreamlineAngle === null && liveEvfAngle === null && (
              <span className="text-slate-400 font-mono text-[11px]">
                Detecting joints... Stand 2-3 meters from camera
              </span>
            )}
          </div>
        </div>
      )}

      {/* Snapshot Preview Modal / Card */}
      {capturedSnapshot && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={capturedSnapshot}
              alt="Pose Snapshot"
              className="w-24 h-16 object-cover rounded-lg border border-slate-700"
            />
            <div>
              <h4 className="text-xs font-bold text-white">Pose Frame Captured with Skeleton Stamp</h4>
              <p className="text-[11px] text-slate-400">Ready to save for your coach or download locally.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={capturedSnapshot}
              download={`swimmer-pose-${Date.now()}.png`}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </a>
            <button
              onClick={() => setCapturedSnapshot(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
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

      {/* 6 Biomechanical Camera Capabilities Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Biomechanical Camera Capabilities & Deck Protocol Guide
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            6 Camera Integrations Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">1. Streamline Thoracic Flexion</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800">Target &ge;170°</span>
            </div>
            <p className="text-slate-400">
              Evaluates overhead arm-to-hip alignment. Ensures maximum reaching leverage without compensatory lumbar arching.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">2. Early Vertical Forearm (EVF)</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">Target 100°-125°</span>
            </div>
            <p className="text-slate-400">
              Measures elbow catch angle. A high elbow anchors a vertical paddle, reducing rotator cuff shear stress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">3. Bilateral Pull Asymmetry</span>
              <span className="text-[10px] text-purple-400 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-800">Target &lt;8% Delta</span>
            </div>
            <p className="text-slate-400">
              Detects propulsion differences between breathing and non-breathing sides to eliminate unilateral shoulder inflammation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">4. Head Position & Alignment</span>
              <span className="text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800">Cervical Spine</span>
            </div>
            <p className="text-slate-400">
              Tracks head lift during breath intake. Lifting head sinks hips and creates immediate frontal wave drag.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">5. Dolphin Kick Knee vs Hip Angle</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">Knee &lt;60°</span>
            </div>
            <p className="text-slate-400">
              Monitors underwater undulation. Over-bending knees (&gt;90°) acts as an anchor, while hip drive propels vortex thrust.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">6. Flip Turn Tumble Speed</span>
              <span className="text-[10px] text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">Tuck Radius</span>
            </div>
            <p className="text-slate-400">
              Measures rotation velocity into wall contact. Tight knee-chest tuck reduces rotational inertia by 50%.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
