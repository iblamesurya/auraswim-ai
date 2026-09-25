import React, { useState, useEffect } from 'react'
import { SMR_PROTOCOLS } from '../../lib/data/smrProtocols'
import type { SMRProtocol } from '../../lib/data/smrProtocols'
import { Play, Pause, RotateCcw, CheckCircle, Sparkles, Volume2 } from 'lucide-react'

export const SMRRoutineGuide: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<SMRProtocol>(SMR_PROTOCOLS[0])
  const [smrMode, setSmrMode] = useState<'pre_swim' | 'post_swim'>('pre_swim')
  const [timeLeft, setTimeLeft] = useState<number>(SMR_PROTOCOLS[0].preSwimDurationSec || 25)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [completedProtocols, setCompletedProtocols] = useState<string[]>([])
  const [contractRelaxPhase, setContractRelaxPhase] = useState<'contract' | 'relax'>('relax')

  const getTargetDuration = (protocol: SMRProtocol, mode: 'pre_swim' | 'post_swim') => {
    return mode === 'pre_swim' ? (protocol.preSwimDurationSec || 25) : protocol.durationSec
  }

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

  const handleSelectProtocol = (protocol: SMRProtocol) => {
    setSelectedProtocol(protocol)
    setTimeLeft(getTargetDuration(protocol, smrMode))
    setIsRunning(false)
  }

  const handleSwitchMode = (mode: 'pre_swim' | 'post_swim') => {
    setSmrMode(mode)
    setTimeLeft(getTargetDuration(selectedProtocol, mode))
    setIsRunning(false)
  }

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playBeep(880, 400)
            setIsRunning(false)
            setCompletedProtocols((done) =>
              done.includes(selectedProtocol.id) ? done : [...done, selectedProtocol.id]
            )
            return 0
          }

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
    <div className="space-y-6 text-white">
      {/* Title & Introduction */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-white" />
              Swimmer Self-Myofascial Release (SMR) Guide
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Authored from Coach Deniz Hekmati’s sports science protocols. Release restricted fascia to prevent "swimmer’s shoulder" and expand stroke reach.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-xs text-neutral-400">Completed:</span>
            <span className="px-2.5 py-1 rounded bg-black text-white text-xs border border-white/20">
              {completedProtocols.length} / {SMR_PROTOCOLS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-black p-1.5 rounded-xl border border-white/20 font-mono">
        <button
          onClick={() => handleSwitchMode('pre_swim')}
          className={`w-full sm:flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            smrMode === 'pre_swim'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Pre-Swim Tack & Floss (25s Dynamic)
        </button>
        <button
          onClick={() => handleSwitchMode('post_swim')}
          className={`w-full sm:flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
            smrMode === 'post_swim'
              ? 'bg-white text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Post-Swim Recovery (60-90s Ischemic GTO Hold)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Protocol Selector List (Left Col) */}
        <div className="lg:col-span-4 space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 px-1">
            Target Muscle Protocols
          </h3>
          <div className="space-y-2">
            {SMR_PROTOCOLS.map((p) => {
              const isSelected = selectedProtocol.id === p.id
              const isDone = completedProtocols.includes(p.id)
              const duration = smrMode === 'pre_swim' ? (p.preSwimDurationSec || 25) : p.durationSec
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectProtocol(p)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-black border-white text-white shadow-sm'
                      : 'bg-neutral-950 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-white block">{p.name}</span>
                    <p className="text-xs text-neutral-400">{p.targetMuscle}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
                      <span className="px-1.5 py-0.5 rounded bg-black border border-white/15 text-white">
                        {p.equipment}
                      </span>
                      <span>{duration}s</span>
                    </div>
                  </div>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-neutral-700 flex-shrink-0 mt-2" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Timer & Protocol Instructions (Right Col) */}
        <div className="lg:col-span-8 bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Active Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                ACTIVE PROTOCOL • {smrMode === 'pre_swim' ? 'PRE-SWIM DYNAMIC' : 'POST-SWIM RESTORATIVE'}
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">{selectedProtocol.name}</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Target: {selectedProtocol.targetMuscle} • Equipment: {selectedProtocol.equipment}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="px-3 py-1 rounded bg-black border border-white/20 text-xs text-white">
                {selectedProtocol.category.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Pre-Swim Tack-and-Floss Action Notice */}
          {smrMode === 'pre_swim' && selectedProtocol.tackAndFlossAction && (
            <div className="p-4 rounded-xl bg-black border border-white/20 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Active Tack & Floss Movement:
              </span>
              <p className="text-xs text-white leading-relaxed">
                {selectedProtocol.tackAndFlossAction}
              </p>
            </div>
          )}

          {/* Timer Display */}
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            <div className="relative w-44 h-44 rounded-full border-4 border-white/10 flex flex-col items-center justify-center bg-black shadow-inner">
              <span className="text-5xl font-mono font-extrabold text-white">
                {timeLeft}s
              </span>
              <span className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 mt-1">
                {isRunning ? 'Timer Active' : timeLeft === 0 ? 'Completed!' : 'Ready'}
              </span>
            </div>

            <div className="space-y-4 max-w-sm w-full">
              {/* Active Contract / Relax cue */}
              <div className="p-4 rounded-xl bg-black border border-white/15 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Dynamic Breath Cue
                </span>
                <div className="text-lg font-bold font-mono text-white">
                  {contractRelaxPhase === 'contract'
                    ? '1. TENSE MUSCLE (3s)'
                    : '2. EXHALE & SINK DEEP (10s)'}
                </div>
                <p className="text-xs text-neutral-400">
                  {contractRelaxPhase === 'contract'
                    ? 'Gently contract the muscle against the ball to trigger GTO autogenic inhibition.'
                    : 'Breathe out slowly through the nose and let the fascia melt over the ball.'}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTimer}
                  className={`flex-1 py-3 px-5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-neutral-800 text-white border border-white/30'
                      : 'bg-white text-black hover:bg-neutral-200 shadow-sm'
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
                  <span>{isRunning ? 'Pause' : timeLeft === 0 ? 'Repeat Routine' : 'Start Timer'}</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="p-3 rounded-xl bg-black hover:bg-neutral-900 text-white border border-white/20 transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Instructions & Coaching Directives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
            <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
              <span className="font-mono font-bold text-white uppercase text-[11px] block">
                Execution Steps:
              </span>
              <ul className="space-y-1.5 text-neutral-300">
                {selectedProtocol.stepByStep.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-neutral-500 font-mono">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2">
              <span className="font-mono font-bold text-white uppercase text-[11px] block">
                Why It Works (Biomechanics):
              </span>
              <p className="text-neutral-300 leading-relaxed font-sans">
                {selectedProtocol.importanceForSwimmer}
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                Technique: {selectedProtocol.contractRelaxTechnique}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
