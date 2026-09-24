import React, { useState, useEffect } from 'react'
import { SMR_PROTOCOLS } from '../../lib/data/smrProtocols'
import type { SMRProtocol } from '../../lib/data/smrProtocols'
import { Play, Pause, RotateCcw, CheckCircle, AlertCircle, ShieldAlert, Sparkles, Volume2 } from 'lucide-react'

export const SMRRoutineGuide: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<SMRProtocol>(SMR_PROTOCOLS[0])
  const [timeLeft, setTimeLeft] = useState<number>(selectedProtocol.durationSec)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [completedProtocols, setCompletedProtocols] = useState<string[]>([])
  const [contractRelaxPhase, setContractRelaxPhase] = useState<'contract' | 'relax'>('relax')

  // Audio tone generator using Web Audio API for zero-dependency sound chimes
  const playBeep = (freq = 440, durationMs = 150) => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + durationMs / 1000)
    } catch {
      // AudioContext may be restricted by browser policy before first interaction
    }
  }

  // Switch protocol
  const handleSelectProtocol = (protocol: SMRProtocol) => {
    setSelectedProtocol(protocol)
    setTimeLeft(protocol.durationSec)
    setIsRunning(false)
  }

  // Timer loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep(880, 400) // Finish chime
            setIsRunning(false)
            setCompletedProtocols((done) =>
              done.includes(selectedProtocol.id) ? done : [...done, selectedProtocol.id]
            )
            return 0
          }

          // Cycle contract-relax cues every 13 seconds (3s contract, 10s relax)
          const cyclePosition = prev % 13
          if (cyclePosition <= 3) {
            setContractRelaxPhase('contract')
          } else {
            setContractRelaxPhase('relax')
          }

          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRunning, timeLeft, selectedProtocol.id])

  const toggleTimer = () => {
    if (!isRunning && timeLeft === 0) {
      setTimeLeft(selectedProtocol.durationSec)
    }
    setIsRunning(!isRunning)
    playBeep(520, 100)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedProtocol.durationSec)
  }

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Swimmer Self-Myofascial Release (SMR) Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authored from Coach Deniz Hekmati’s sports science protocols. Release restricted fascia to prevent "swimmer’s shoulder" and expand stroke reach.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Completed:</span>
            <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 font-mono text-xs border border-cyan-800">
              {completedProtocols.length} / {SMR_PROTOCOLS.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Protocol Selector List (Left Col) */}
        <div className="lg:col-span-4 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Target Muscle Protocols
          </h3>
          <div className="space-y-2">
            {SMR_PROTOCOLS.map((p) => {
              const isSelected = selectedProtocol.id === p.id
              const isDone = completedProtocols.includes(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProtocol(p)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-500/60 text-white shadow-lg'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{p.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{p.targetMuscle}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {p.equipment}
                      </span>
                      <span>{p.durationSec}s</span>
                    </div>
                  </div>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 flex-shrink-0 mt-2"></span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Protocol Interactive Panel (Right Col) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-medium">
                  {selectedProtocol.category.toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  Required Tool: <strong className="text-slate-200">{selectedProtocol.equipment}</strong>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedProtocol.name}
              </h3>
            </div>

            {/* Timer Display & Controls */}
            <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
              <div className="text-center font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-cyan-400">
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTimer}
                  className={`p-2.5 rounded-xl font-semibold flex items-center justify-center transition-all ${
                    isRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  }`}
                  title={isRunning ? 'Pause' : 'Start'}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contract-Relax Cue Banner */}
          {isRunning && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                contractRelaxPhase === 'contract'
                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {contractRelaxPhase === 'contract'
                    ? '⚡ Tense & Contract Muscle (3 Seconds)'
                    : '🌬️ Exhale & Sink Over Ball (10 Seconds)'}
                </span>
              </div>
              <span className="text-xs font-mono">
                {contractRelaxPhase === 'contract' ? 'Hold & Squeeze' : 'Deep Melt'}
              </span>
            </div>
          )}

          {/* Why it Matters for Swimmers */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <h4 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">
              Why This Matters for Her Swimming:
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedProtocol.importanceForSwimmer}
            </p>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Step-by-Step Technique:
            </h4>
            <div className="space-y-2">
              {selectedProtocol.stepByStep.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Tip and Safety Warning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block mb-0.5">
                  Visual & Body Cue:
                </span>
                <p className="text-xs text-slate-400">{selectedProtocol.visualTip}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block mb-0.5">
                  Safety Precaution:
                </span>
                <p className="text-xs text-slate-400">{selectedProtocol.warning}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
