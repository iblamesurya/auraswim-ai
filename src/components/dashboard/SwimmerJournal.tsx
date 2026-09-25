import React, { useState, useEffect } from 'react'
import {
  loadSwimmerData,
  addWorkout,
  addShoulderLog,
  exportCoachReportJSON,
  type SwimmerProfileStore,
} from '../../lib/storage/swimmerStore'
import { PlusCircle, Download, ShieldCheck, Flame, Calendar, Activity, Check, HeartPulse, Copy } from 'lucide-react'

export const SwimmerJournal: React.FC = () => {
  const [store, setStore] = useState<SwimmerProfileStore>(loadSwimmerData())
  const [activeSubTab, setActiveSubTab] = useState<'workouts' | 'shoulder' | 'export'>('workouts')
  const [copied, setCopied] = useState(false)

  // Clean form states for new workout (no fake pre-populated values)
  const [meters, setMeters] = useState<number | ''>('')
  const [durationMin, setDurationMin] = useState<number | ''>('')
  const [rpe, setRpe] = useState<number | ''>('')
  const [strokeRate, setStrokeRate] = useState<number | ''>('')
  const [dps, setDps] = useState<number | ''>('')
  const [workoutNotes, setWorkoutNotes] = useState('')

  // Clean form states for new shoulder check
  const [painLevel, setPainLevel] = useState<number>(0)
  const [affectedSide, setAffectedSide] = useState<'none' | 'left' | 'right' | 'both'>('none')
  const [mobilityScore, setMobilityScore] = useState<number>(100)
  const [shoulderNotes, setShoulderNotes] = useState('')

  useEffect(() => {
    setStore(loadSwimmerData())
  }, [])

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedMeters = Number(meters)
    if (!parsedMeters || parsedMeters <= 0) return

    const updated = addWorkout({
      date: new Date().toISOString().split('T')[0],
      meters: parsedMeters,
      durationMin: Number(durationMin) || 60,
      rpeScale1to10: Number(rpe) || 5,
      strokeRateSpm: strokeRate !== '' ? Number(strokeRate) : undefined,
      dpsMeters: dps !== '' ? Number(dps) : undefined,
      notes: workoutNotes.trim() ? workoutNotes.trim() : undefined,
    })
    setStore(updated)
    setMeters('')
    setDurationMin('')
    setRpe('')
    setStrokeRate('')
    setDps('')
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
      notes: shoulderNotes.trim() ? shoulderNotes.trim() : undefined,
    })
    setStore(updated)
    setPainLevel(0)
    setAffectedSide('none')
    setMobilityScore(100)
    setShoulderNotes('')
  }

  const handleCopyReport = () => {
    navigator.clipboard.writeText(exportCoachReportJSON())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              ATHLETE TRAINING & HEALTH LOG
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <Calendar className="w-5 h-5 text-white" />
              Swimmer Journal & Shoulder History
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Log daily pool yardage, SMR completion, and shoulder soreness to keep her training in the sweet spot and share data with her coach.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">SMR Streak:</span>
              <strong className="text-white">{store.smrStreakDays} Days</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">Workouts:</span>
              <strong className="text-white">{store.workouts.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-white/15">
        <button
          onClick={() => setActiveSubTab('workouts')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'workouts'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Workout Logs ({store.workouts.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('shoulder')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'shoulder'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Shoulder Soreness Logs ({store.shoulderLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('export')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'export'
              ? 'bg-white text-black font-semibold shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Coach Report</span>
        </button>
      </div>

      {/* Workouts View */}
      {activeSubTab === 'workouts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Workout Form */}
          <form
            onSubmit={handleSaveWorkout}
            className="lg:col-span-5 bg-neutral-950 border border-white/15 p-5 rounded-2xl shadow-sm space-y-4"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-white" />
              Log Practice Session
            </h3>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Volume (Meters):</label>
              <input
                type="number"
                step="50"
                min="50"
                value={meters}
                onChange={(e) => setMeters(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 5000"
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-white placeholder-neutral-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Duration (Min):</label>
                <input
                  type="number"
                  min="1"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 90"
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Session RPE (1-10):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="1 - 10"
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Stroke Rate (spm):</label>
                <input
                  type="number"
                  min="20"
                  max="70"
                  value={strokeRate}
                  onChange={(e) => setStrokeRate(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 44 (optional)"
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">DPS (Meters):</label>
                <input
                  type="number"
                  step="0.05"
                  min="0.5"
                  max="3.0"
                  value={dps}
                  onChange={(e) => setDps(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 1.90 (optional)"
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white placeholder-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Set Notes / Focus:</label>
              <textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="e.g., 10x100m threshold free on 1:20, kept high elbow catch."
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-white resize-none h-16 focus:outline-none focus:border-white placeholder-neutral-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs transition-colors"
            >
              Save Workout Log
            </button>
          </form>

          {/* Workout History List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 font-mono">
              Logged Workouts ({store.workouts.length})
            </h3>
            {store.workouts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-2">
                <Activity className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No workouts logged yet</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Log your sister's practice sessions above or parse a set in the Commit Workout Parser to start tracking true training load.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {store.workouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">{w.date}</span>
                      <span className="px-2 py-0.5 rounded bg-black border border-white/15 text-white">
                        RPE {w.rpeScale1to10}/10
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between font-mono">
                      <div className="text-xl font-bold text-white">
                        {w.meters.toLocaleString()} <span className="text-xs font-normal text-neutral-400">meters</span>
                      </div>
                      <span className="text-xs text-neutral-400">{w.durationMin} minutes</span>
                    </div>
                    {w.strokeRateSpm && (
                      <div className="text-[11px] font-mono text-neutral-400 flex gap-3">
                        <span>Cadence: {w.strokeRateSpm} spm</span>
                        {w.dpsMeters && <span>DPS: {w.dpsMeters}m</span>}
                      </div>
                    )}
                    {w.notes && (
                      <p className="text-xs text-neutral-300 italic pt-1 border-t border-white/5">
                        "{w.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shoulder Soreness View */}
      {activeSubTab === 'shoulder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleSaveShoulder}
            className="lg:col-span-5 bg-neutral-950 border border-white/15 p-5 rounded-2xl shadow-sm space-y-4"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-white" />
              Log Shoulder Soreness Check
            </h3>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1 font-mono">
                <span>Pain Scale (0-10):</span>
                <span className="font-bold text-white">{painLevel} / 10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Affected Shoulder:</label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {(['none', 'left', 'right', 'both'] as const).map((side) => (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setAffectedSide(side)}
                    className={`py-1.5 rounded-lg text-xs border uppercase ${
                      affectedSide === side
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-black text-neutral-400 border-white/15 hover:border-white'
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-400 mb-1 font-mono">
                <span>Estimated Mobility (0-100%):</span>
                <span className="font-bold text-white">{mobilityScore}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={mobilityScore}
                onChange={(e) => setMobilityScore(Number(e.target.value))}
                className="w-full accent-white cursor-pointer h-2 bg-neutral-900 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Soreness Notes:</label>
              <textarea
                value={shoulderNotes}
                onChange={(e) => setShoulderNotes(e.target.value)}
                placeholder="e.g., Felt tight in pec minor during butterfly sprint."
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs text-white resize-none h-16 focus:outline-none focus:border-white placeholder-neutral-600"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-white hover:bg-neutral-200 text-black font-semibold rounded-xl text-xs transition-colors"
            >
              Save Shoulder Check
            </button>
          </form>

          {/* Shoulder Log History */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 px-1 font-mono">
              Shoulder Health Logs ({store.shoulderLogs.length})
            </h3>
            {store.shoulderLogs.length === 0 ? (
              <div className="p-8 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-2">
                <HeartPulse className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-sm font-semibold text-white">No shoulder soreness logs recorded</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Log your sister's shoulder status above whenever she feels anterior tightness or stiffness.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {store.shoulderLogs.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl bg-neutral-950 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">{s.date}</span>
                      <span className={`px-2 py-0.5 rounded border text-xs font-bold ${
                        s.painScale1to10 >= 4
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-white border-white/20'
                      }`}>
                        PAIN {s.painScale1to10}/10 ({s.affectedSide.toUpperCase()})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">Mobility Assessment:</span>
                      <span className="text-white font-bold">{s.mobilityScore1to100}%</span>
                    </div>
                    {s.triggerPointsNoted?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {s.triggerPointsNoted.map((tp) => (
                          <span
                            key={tp}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-black border border-white/15 text-white"
                          >
                            {tp}
                          </span>
                        ))}
                      </div>
                    )}
                    {s.notes && (
                      <p className="text-xs text-neutral-300 italic pt-1 border-t border-white/5">
                        "{s.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Export View */}
      {activeSubTab === 'export' && (
        <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Export Athlete Biometrics to Coach
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generate clean, structured JSON or text summaries of her yardage, ACWR load, and shoulder soreness history.
              </p>
            </div>
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy JSON Report'}</span>
            </button>
          </div>

          <pre className="bg-black border border-white/10 rounded-xl p-4 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-[350px]">
            {exportCoachReportJSON()}
          </pre>
        </div>
      )}
    </div>
  )
}
