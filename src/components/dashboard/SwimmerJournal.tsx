import React, { useState, useEffect } from 'react'
import {
  loadSwimmerData,
  addWorkout,
  addShoulderLog,
  exportCoachReportJSON,
  type SwimmerProfileStore,
} from '../../lib/storage/swimmerStore'
import { PlusCircle, Download, ShieldCheck, Flame, Calendar, Activity, Check, HeartPulse } from 'lucide-react'

export const SwimmerJournal: React.FC = () => {
  const [store, setStore] = useState<SwimmerProfileStore>(loadSwimmerData())
  const [activeSubTab, setActiveSubTab] = useState<'workouts' | 'shoulder' | 'export'>('workouts')
  const [copied, setCopied] = useState(false)

  // Form states for new workout
  const [meters, setMeters] = useState(5200)
  const [durationMin, setDurationMin] = useState(90)
  const [rpe, setRpe] = useState(7)
  const [strokeRate, setStrokeRate] = useState(44)
  const [dps, setDps] = useState(1.9)
  const [workoutNotes, setWorkoutNotes] = useState('')

  // Form states for new shoulder check
  const [painLevel, setPainLevel] = useState(2)
  const [affectedSide, setAffectedSide] = useState<'none' | 'left' | 'right' | 'both'>('none')
  const [mobilityScore, setMobilityScore] = useState(85)
  const [shoulderNotes, setShoulderNotes] = useState('')

  useEffect(() => {
    setStore(loadSwimmerData())
  }, [])

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = addWorkout({
      date: new Date().toISOString().split('T')[0],
      meters: Number(meters),
      durationMin: Number(durationMin),
      rpeScale1to10: Number(rpe),
      strokeRateSpm: Number(strokeRate),
      dpsMeters: Number(dps),
      notes: workoutNotes || 'Standard team practice',
    })
    setStore(updated)
    setWorkoutNotes('')
  }

  const handleSaveShoulder = (e: React.FormEvent) => {
    e.preventDefault()
    const updated = addShoulderLog({
      date: new Date().toISOString().split('T')[0],
      painScale1to10: Number(painLevel),
      affectedSide,
      triggerPointsNoted: painLevel > 2 ? ['Pec Minor', 'Subscapularis'] : [],
      mobilityScore1to100: Number(mobilityScore),
      notes: shoulderNotes || 'Routine shoulder check-in',
    })
    setStore(updated)
    setShoulderNotes('')
  }

  const handleCopyReport = () => {
    navigator.clipboard.writeText(exportCoachReportJSON())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
              ATHLETE TRAINING & HEALTH LOG
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Swimmer Journal & Shoulder History
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Log daily pool yardage, SMR completion, and shoulder soreness to keep her training in the sweet spot and share data with her coach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">SMR Streak:</span>
              <strong className="text-amber-400 font-mono">{store.smrStreakDays} Days</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">Logged Workouts:</span>
              <strong className="text-emerald-400 font-mono">{store.workouts.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('workouts')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'workouts'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Workout Logs ({store.workouts.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('shoulder')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'shoulder'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Shoulder Soreness Logs ({store.shoulderLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('export')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'export'
              ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Coach Report</span>
        </button>
      </div>

      {/* Workouts View */}
      {activeSubTab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Workout Form */}
          <form
            onSubmit={handleSaveWorkout}
            className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Log Practice Session
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Volume (Meters):</label>
              <input
                type="number"
                step="100"
                value={meters}
                onChange={(e) => setMeters(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Duration (Min):</label>
                <input
                  type="number"
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Session RPE (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Stroke Rate (spm):</label>
                <input
                  type="number"
                  value={strokeRate}
                  onChange={(e) => setStrokeRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">DPS (Meters):</label>
                <input
                  type="number"
                  step="0.05"
                  value={dps}
                  onChange={(e) => setDps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Set Notes / Focus:</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="e.g., 10x100m threshold free on 1:20, kept high elbow catch."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white resize-none h-16"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-cyan-500/20"
            >
              Save Workout Log
            </button>
          </form>

          {/* Workout History List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Logged Workouts ({store.workouts.length})
            </h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {store.workouts.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{w.date}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      RPE {w.rpeScale1to10}/10
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-xl font-bold text-white font-mono">
                      {w.meters.toLocaleString()} <span className="text-xs font-normal text-slate-400">meters</span>
                    </div>
                    <span className="text-xs text-slate-400">{w.durationMin} minutes</span>
                  </div>
                  {w.notes && <p className="text-xs text-slate-300 italic">{w.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Shoulder Soreness View */}
      {activeSubTab === 'shoulder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Shoulder Log Form */}
          <form
            onSubmit={handleSaveShoulder}
            className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              Log Shoulder Soreness & Readiness
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Pain / Pinching Scale (0 = None, 10 = Severe):</span>
                <span className={`font-bold font-mono ${painLevel > 3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {painLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Affected Shoulder:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['none', 'left', 'right', 'both'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setAffectedSide(side)}
                    className={`py-1.5 rounded-lg text-xs font-semibold capitalize border ${
                      affectedSide === side
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Streamline Mobility Score:</span>
                <span className="font-mono text-cyan-400 font-bold">{mobilityScore} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={mobilityScore}
                onChange={(e) => setMobilityScore(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Symptoms / Notes:</label>
              <textarea
                value={shoulderNotes}
                onChange={(e) => setShoulderNotes(e.target.value)}
                placeholder="e.g., Felt pinching during fly recovery; released pec minor with ball."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white resize-none h-16"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-md shadow-cyan-500/20"
            >
              Save Shoulder Check
            </button>
          </form>

          {/* Shoulder Log History */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Shoulder Health Trend
            </h3>
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {store.shoulderLogs.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">{s.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-xs ${
                        s.painScale1to10 <= 2
                          ? 'bg-emerald-950 text-emerald-400'
                          : s.painScale1to10 <= 4
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      Pain Score: {s.painScale1to10}/10 ({s.affectedSide} side)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Overhead Mobility: <strong>{s.mobilityScore1to100}/100</strong></span>
                    {s.triggerPointsNoted.length > 0 && (
                      <span className="text-amber-300">
                        Tight: {s.triggerPointsNoted.join(', ')}
                      </span>
                    )}
                  </div>
                  {s.notes && <p className="text-xs text-slate-400 italic">{s.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Report View */}
      {activeSubTab === 'export' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-cyan-400" />
                Export Swimmer Bio-Report for Coach
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Export all workout yardage, SMR consistency, and shoulder symptom logs into a clean, formatted report.
              </p>
            </div>
            <button
              onClick={handleCopyReport}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON Report'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300/90 overflow-x-auto max-h-[360px]">
            {exportCoachReportJSON()}
          </pre>
        </div>
      )}
    </div>
  )
}
