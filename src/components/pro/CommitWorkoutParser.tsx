import React, { useState, useMemo } from 'react'
import {
  parseCommitWorkout,
  ENERGY_ZONE_DEFINITIONS,
} from '../../lib/biomechanics/commitWorkoutParser'
import { addWorkout } from '../../lib/storage/swimmerStore'
import { generateProSwimWorkout, getStoredApiKey } from '../../lib/ai/proAIService'
import {
  FileCode,
  Sparkles,
  Flame,
  PlusCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'

const SAMPLE_COLLEGIATE_WORKOUT = `# USA Swimming Collegiate Threshold & Speed Practice
Warm-Up:
400 Swim EN1 easy long reach
4x100 Kick on 1:45 EN1 (streamline on back)
8x50 Drill/Swim on :50 EN2 (25 EVF sculling + 25 swim)

Main Threshold Set:
10x100 Freestyle on 1:15 EN2 hold pace
6x50 Butterfly on :55 SP1 ascend/descend
8x25 Underwater Dolphin Kick on :40 SP3 alactic breakout

Cool-Down:
300 Choice easy EN1 long stroke recovery`

export const CommitWorkoutParser: React.FC<{ onWorkoutLogged?: () => void; onOpenApiKeyModal?: () => void }> = ({
  onWorkoutLogged,
  onOpenApiKeyModal,
}) => {
  const [workoutText, setWorkoutText] = useState(SAMPLE_COLLEGIATE_WORKOUT)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStroke, setGenStroke] = useState<'Freestyle' | 'Butterfly' | 'Backstroke' | 'Breaststroke' | 'IM'>('Freestyle')
  const [genFocus, setGenFocus] = useState<'aerobic_threshold' | 'vo2max_speed' | 'sprint_alactic' | 'im_technical' | 'recovery_taper'>('aerobic_threshold')
  const genMeters = 5000
  const [logSuccessMessage, setLogSuccessMessage] = useState(false)

  const analysis = useMemo(() => parseCommitWorkout(workoutText), [workoutText])
  const apiKey = getStoredApiKey()

  const handleLogToProfile = () => {
    addWorkout({
      date: new Date().toISOString().split('T')[0],
      meters: analysis.totalDistance,
      durationMin: analysis.estimatedDurationMinutes || 90,
      rpeScale1to10: analysis.primaryFocusZone.startsWith('SP') ? 8 : 6,
      notes: `Logged via Commit Workout Parser. Focus: ${analysis.primaryFocusZone} (${ENERGY_ZONE_DEFINITIONS[analysis.primaryFocusZone].name})`,
    })
    setLogSuccessMessage(true)
    setTimeout(() => setLogSuccessMessage(false), 2500)
    if (onWorkoutLogged) onWorkoutLogged()
  }

  const handleGenerateAI = async () => {
    if (!apiKey) {
      if (onOpenApiKeyModal) onOpenApiKeyModal()
      return
    }

    setIsGenerating(true)
    try {
      const zone = genFocus === 'sprint_alactic' ? 'SP3' : genFocus === 'vo2max_speed' ? 'SP1' : genFocus === 'recovery_taper' ? 'EN1' : 'EN2'
      const generated = await generateProSwimWorkout({
        focus: genFocus,
        stroke: genStroke,
        targetMeters: genMeters,
        energyZoneFocus: zone,
      })
      setWorkoutText(generated)
    } catch (err) {
      console.warn('AI Workout Generation failed:', err)
      alert('Could not generate AI workout. Please verify your Meta AI / OpenRouter key.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              COMMIT SWIMMING PRO ENGINE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <FileCode className="w-5 h-5 text-white" />
              Workout Set Syntax Parser & Lactate Energy Zones
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Type or paste real collegiate/club workouts (e.g. <code className="text-white font-mono">10x100 on 1:15 Free @ EN2</code>). Automatically calculates total yardage and graphs the 6 lactate energy zones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogToProfile}
              className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log {analysis.totalDistance.toLocaleString()}m to Journal</span>
            </button>
          </div>
        </div>
      </div>

      {logSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/30 text-xs text-white flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>Workout of <strong>{analysis.totalDistance.toLocaleString()}m</strong> successfully logged to Swimmer Profile!</span>
        </div>
      )}

      {/* Main Parser & Energy Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Syntax Editor (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-white" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Workout Script Editor
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-neutral-400">
                Sets: <strong className="text-white">{analysis.itemCount}</strong>
              </span>
              <span className="text-neutral-400">
                Duration: <strong className="text-white">~{analysis.estimatedDurationMinutes} min</strong>
              </span>
            </div>
          </div>

          <textarea
            value={workoutText}
            onChange={(e) => setWorkoutText(e.target.value)}
            rows={12}
            className="w-full bg-black border border-white/15 focus:border-white rounded-xl p-4 text-xs sm:text-sm font-mono text-white placeholder-neutral-600 focus:outline-none leading-relaxed resize-none transition-colors"
            placeholder="Type your swim set here..."
          />

          {/* AI Generator Quick Bar */}
          <div className="p-4 rounded-xl bg-black border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white">
                <Sparkles className="w-4 h-4 text-white" />
                <span>AI Pro Workout Generator (Meta AI / LLM)</span>
              </div>
              <button
                onClick={onOpenApiKeyModal}
                className="text-[11px] font-mono text-neutral-400 hover:text-white underline"
              >
                Settings &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono">
              <select
                value={genStroke}
                onChange={(e) => setGenStroke(e.target.value as typeof genStroke)}
                className="bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="Freestyle">Freestyle Focus</option>
                <option value="Butterfly">Butterfly Focus</option>
                <option value="Backstroke">Backstroke Focus</option>
                <option value="Breaststroke">Breaststroke Focus</option>
                <option value="IM">Individual Medley</option>
              </select>

              <select
                value={genFocus}
                onChange={(e) => setGenFocus(e.target.value as typeof genFocus)}
                className="bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="aerobic_threshold">EN2 Threshold</option>
                <option value="vo2max_speed">SP1 VO2 Max</option>
                <option value="sprint_alactic">SP3 Alactic Speed</option>
                <option value="im_technical">IM Technical</option>
                <option value="recovery_taper">EN1 Recovery Taper</option>
              </select>

              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isGenerating ? 'Generating...' : 'Generate Set'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Energy Zones & Analytics (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-white" />
              Lactate Energy Zone Breakdown
            </h3>
            <span className="text-xs font-mono font-bold text-white">
              Total: {analysis.totalDistance.toLocaleString()}m
            </span>
          </div>

          {/* Energy Zone Bars */}
          <div className="space-y-3 font-mono">
            {(Object.keys(ENERGY_ZONE_DEFINITIONS) as Array<keyof typeof ENERGY_ZONE_DEFINITIONS>).map((zone) => {
              const def = ENERGY_ZONE_DEFINITIONS[zone]
              const meters = analysis.zoneMeters[zone]
              const pct = analysis.zonePercentages[zone]

              return (
                <div key={zone} className="p-3 rounded-xl bg-black border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <strong className="text-white">{zone}</strong>
                      <span className="text-neutral-400 text-[11px] truncate max-w-[130px]">{def.name}</span>
                    </div>
                    <span className="text-white">
                      <strong>{meters.toLocaleString()}m</strong> ({pct}%)
                    </span>
                  </div>

                  {/* Meter Progress Bar (Monochrome) */}
                  <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-white transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-0.5">
                    <span>{def.hrTarget}</span>
                    <span>Lactate: {def.lactate}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
