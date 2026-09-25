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
  PlusCircle,
  Activity,
  CheckCircle2,
  RefreshCw,
  BookOpen,
} from 'lucide-react'

export const SAMPLE_COLLEGIATE_WORKOUT = `# USA Swimming Collegiate Threshold & Speed Practice
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
  // Starts clean and empty by default (zero fake pre-loaded values)
  const [workoutText, setWorkoutText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStroke, setGenStroke] = useState<'Freestyle' | 'Butterfly' | 'Backstroke' | 'Breaststroke' | 'IM'>('Freestyle')
  const [genFocus, setGenFocus] = useState<'aerobic_threshold' | 'vo2max_speed' | 'sprint_alactic' | 'im_technical' | 'recovery_taper'>('aerobic_threshold')
  const [genTargetMeters, setGenTargetMeters] = useState<number>(4500)
  const [logSuccessMessage, setLogSuccessMessage] = useState(false)

  const analysis = useMemo(() => parseCommitWorkout(workoutText), [workoutText])
  const apiKey = getStoredApiKey()

  const handleLogToProfile = () => {
    if (analysis.totalDistance <= 0) return

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
        targetMeters: genTargetMeters,
        energyZoneFocus: zone,
      })
      setWorkoutText(generated)
    } catch (err) {
      console.error('Workout generation failed:', err)
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
              COMMIT SWIMMING WORKOUT PARSER & DSL
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <FileCode className="w-5 h-5 text-white" />
              Interval Notation Parser & Energy Zone Decomposer
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Type or paste practice sets using standard swim notation (e.g. <code>10x100 on 1:15 EN2</code>). Automatically calculates total yardage, estimated duration, mechanical strain, and Olbrecht energy distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setWorkoutText(SAMPLE_COLLEGIATE_WORKOUT)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 hover:border-white text-xs text-neutral-300 hover:text-white transition-colors font-mono"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Load Sample Template</span>
            </button>
            {workoutText && (
              <button
                onClick={() => setWorkoutText('')}
                className="px-3 py-1.5 rounded-xl border border-white/20 hover:border-white text-xs text-neutral-400 hover:text-white transition-colors font-mono"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleLogToProfile}
              disabled={analysis.totalDistance <= 0}
              className={`flex items-center gap-1.5 font-semibold px-4 py-2 rounded-xl text-xs transition-all shadow-sm ${
                analysis.totalDistance > 0
                  ? 'bg-white hover:bg-neutral-200 text-black cursor-pointer'
                  : 'bg-neutral-900 border border-white/15 text-neutral-600 cursor-not-allowed'
              }`}
            >
              {logSuccessMessage ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Logged to Profile!</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log to Swimmer Profile ({analysis.totalDistance.toLocaleString()}m)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Area & AI Generation (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-white" />
              Swim Set Input & Code Syntax
            </h3>
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
            placeholder="Paste or type your swim practice here...&#10;e.g.&#10;400 Swim EN1 easy&#10;10x100 on 1:15 EN2 hold pace&#10;8x50 Butterfly on :55 SP1&#10;200 Choice warm down"
          />

          {/* AI Generator Quick Bar */}
          <div className="p-4 rounded-xl bg-black border border-white/15 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-white">
                <Sparkles className="w-4 h-4 text-white" />
                <span>AI Olympic Workout Generator (Edge Neural Engine)</span>
              </div>
              <button
                onClick={onOpenApiKeyModal}
                className="text-[11px] font-mono text-neutral-400 hover:text-white underline"
              >
                Settings &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono">
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

              <select
                value={genTargetMeters}
                onChange={(e) => setGenTargetMeters(Number(e.target.value))}
                className="bg-neutral-900 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white"
              >
                <option value="3000">3,000m Volume</option>
                <option value="4000">4,000m Volume</option>
                <option value="4500">4,500m Volume</option>
                <option value="5000">5,000m Volume</option>
                <option value="6000">6,000m Volume</option>
                <option value="7500">7,500m Volume</option>
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
        <div className="lg:col-span-5 space-y-4">
          {/* Total Yardage & Primary Focus */}
          <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Total Volume Breakdown
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white font-mono">
                {analysis.totalDistance.toLocaleString()}
                <span className="text-sm font-normal text-neutral-400 ml-1">meters</span>
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/20 bg-neutral-900 text-white">
                {analysis.primaryFocusZone} Primary
              </span>
            </div>

            {analysis.totalDistance === 0 ? (
              <p className="text-xs text-neutral-500 italic font-mono pt-2 border-t border-white/10">
                Awaiting workout text. Enter your practice or click "Load Sample Template" above to parse energy zones.
              </p>
            ) : (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs text-neutral-300 font-mono">
                  <span>Primary Zone:</span>
                  <span className="font-semibold text-white">
                    {ENERGY_ZONE_DEFINITIONS[analysis.primaryFocusZone]?.name || analysis.primaryFocusZone}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-neutral-300 font-mono">
                  <span>Estimated Total Duration:</span>
                  <span className="font-semibold text-white">~{analysis.estimatedDurationMinutes} minutes</span>
                </div>
              </div>
            )}
          </div>

          {/* Energy Zone Distribution Bar */}
          <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-white" />
                Olbrecht Energy Zone Spectrum
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">Jan Olbrecht (2000)</span>
            </div>

            <div className="space-y-2.5">
              {(Object.keys(ENERGY_ZONE_DEFINITIONS) as Array<keyof typeof ENERGY_ZONE_DEFINITIONS>).map((zone) => {
                const def = ENERGY_ZONE_DEFINITIONS[zone]
                const meters = analysis.zoneMeters[zone] || 0
                const pct = analysis.totalDistance > 0 ? Math.round((meters / analysis.totalDistance) * 100) : 0

                return (
                  <div key={zone} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-300">
                        <strong className="text-white">{zone}</strong> - {def.name}
                      </span>
                      <span className="text-neutral-400">
                        {meters > 0 ? `${meters}m (${pct}%)` : '—'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-white transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
