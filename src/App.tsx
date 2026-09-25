import { useState, useEffect, useMemo } from 'react'
import { Header } from './components/common/Header'
import { MobileNav } from './components/common/MobileNav'
import { ApiKeyModal } from './components/common/ApiKeyModal'
import { PoseCamera } from './components/camera/PoseCamera'
import { SMRRoutineGuide } from './components/smr/SMRRoutineGuide'
import { FasciaBodyMap } from './components/smr/FasciaBodyMap'
import { TrainingScheduler } from './components/dashboard/TrainingScheduler'
import { InjuryRiskGauge } from './components/dashboard/InjuryRiskGauge'
import { MetricsTracker } from './components/dashboard/MetricsTracker'
import { SwimmerJournal } from './components/dashboard/SwimmerJournal'
import { ResearchSourcesExplorer } from './components/research/ResearchSourcesExplorer'
import { AICoachChat } from './components/ai-coach/AICoachChat'
import { DartfishVideoStudio } from './components/pro/DartfishVideoStudio'
import { CommitWorkoutParser } from './components/pro/CommitWorkoutParser'
import { TritonRacePacer } from './components/pro/TritonRacePacer'
import { loadSwimmerData, recordSMRCompletion, updateSwimmerProfile } from './lib/storage/swimmerStore'
import { calculateFromDailyLoads } from './lib/biomechanics/acwrModel'
import type { SMRProtocol } from './lib/data/smrProtocols'
import {
  Waves,
  ShieldCheck,
  Flame,
  Sparkles,
  BookOpen,
  Video,
  FileCode,
  Timer,
  Edit2,
  Check,
  X,
} from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('schedule')
  const [smrSubView, setSmrSubView] = useState<'map' | 'timer'>('map')
  const [proSubView, setProSubView] = useState<'dartfish' | 'commit' | 'triton'>('dartfish')
  const [storeData, setStoreData] = useState(loadSwimmerData())
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(storeData.swimmerName)
  const [editTarget, setEditTarget] = useState(storeData.weeklyTargetMeters)

  useEffect(() => {
    const data = loadSwimmerData()
    setStoreData(data)
    setEditName(data.swimmerName)
    setEditTarget(data.weeklyTargetMeters)
  }, [activeTab])

  // Real calculations without fake hardcoded values
  const realTelemetry = useMemo(() => {
    const workouts = storeData.workouts || []
    const totalLoggedMeters = workouts.reduce((acc, w) => acc + w.meters, 0)

    // Calculate real ACWR if workouts exist
    let acwrDisplay = 'Awaiting Logs (Min. 7 Days)'
    let acwrZone = 'No Baseline'

    if (workouts.length >= 7) {
      // Map daily loads for last 28 days
      const dailyMap: Record<string, number> = {}
      workouts.forEach((w) => {
        dailyMap[w.date] = (dailyMap[w.date] || 0) + (w.meters * (w.rpeScale1to10 || 5))
      })
      const loads = Object.values(dailyMap)
      const acwrRes = calculateFromDailyLoads(loads)
      if (acwrRes.chronicLoad > 0) {
        acwrDisplay = `${acwrRes.acwr.toFixed(2)} (${acwrRes.riskLabel})`
        acwrZone = acwrRes.riskLabel
      }
    } else if (workouts.length > 0) {
      acwrDisplay = `${workouts.length} of 7 sessions logged`
      acwrZone = 'Building Baseline'
    }

    const latestShoulder = storeData.shoulderLogs?.[0]
    const shoulderDisplay = latestShoulder
      ? `Pain: ${latestShoulder.painScale1to10}/10 (${latestShoulder.affectedSide})`
      : 'No pain logged'

    return {
      totalLoggedMeters,
      acwrDisplay,
      acwrZone,
      shoulderDisplay,
      hasWorkouts: workouts.length > 0,
    }
  }, [storeData])

  const handleLaunchProtocolFromMap = (protocol: SMRProtocol) => {
    recordSMRCompletion(protocol.id)
    setSmrSubView('timer')
    setStoreData(loadSwimmerData())
  }

  const handleSaveProfile = () => {
    const updated = updateSwimmerProfile({
      name: editName.trim() || 'Competitive Swimmer',
      weeklyTargetMeters: Number(editTarget) || 0,
    })
    setStoreData(updated)
    setIsEditingProfile(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black pb-24 lg:pb-8">
      {/* Top Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Real Swimmer Telemetry Status Bar */}
        <section className="bg-neutral-950 border border-white/15 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">{storeData.swimmerName}</h1>
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-1 text-neutral-400 hover:text-white transition-colors"
                  title="Edit Swimmer Profile & Target"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-neutral-400">
                Target: {storeData.weeklyTargetMeters > 0 ? `${storeData.weeklyTargetMeters.toLocaleString()}m` : 'Not configured'} • ACWR: {realTelemetry.acwrDisplay}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/10">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">SMR Streak:</span>
              <strong className="text-white">{storeData.smrStreakDays} Days</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">Shoulder:</span>
              <strong className="text-white">{realTelemetry.shoulderDisplay}</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">Vision:</span>
              <strong className="text-white">MoveNet</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-white" />
              <span className="text-neutral-400">Corpus:</span>
              <strong className="text-white">100 Studies</strong>
            </div>
          </div>
        </section>

        {/* Profile Edit Inline Modal */}
        {isEditingProfile && (
          <div className="p-4 rounded-2xl bg-neutral-950 border border-white/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Configure Swimmer Profile
              </span>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Swimmer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Sister / Athlete Name"
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Weekly Target Meterage</label>
                <input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(Number(e.target.value))}
                  placeholder="e.g. 30000"
                  className="w-full bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Daily Workflow */}
        {activeTab === 'schedule' && (
          <TrainingScheduler onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {/* Tab 2: Real-time AI Computer Vision */}
        {activeTab === 'camera' && (
          <section className="space-y-4">
            <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                MoveNet Real-Time Kinematic Analysis
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Client-side MoveNet pose estimation measuring overhead streamline flexion, early vertical forearm (EVF) catch angles, and pull asymmetry live through your camera.
              </p>
            </div>
            <PoseCamera />
          </section>
        )}

        {/* Tab 3: Pro Software Suite (Dartfish, Commit Swimming, TritonWear/Omega) */}
        {activeTab === 'pro-suite' && (
          <section className="space-y-6">
            {/* Pro Suite Sub-Navigation */}
            <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-white/15">
              <button
                onClick={() => setProSubView('dartfish')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  proSubView === 'dartfish'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dartfish & Kinovea</span> Video Studio
              </button>
              <button
                onClick={() => setProSubView('commit')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  proSubView === 'commit'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Commit Swimming</span> Workout Parser
              </button>
              <button
                onClick={() => setProSubView('triton')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                  proSubView === 'triton'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TritonWear & Omega</span> Race Pacer
              </button>
            </div>

            {/* Sub-Views */}
            {proSubView === 'dartfish' && <DartfishVideoStudio />}
            {proSubView === 'commit' && (
              <CommitWorkoutParser
                onWorkoutLogged={() => setStoreData(loadSwimmerData())}
                onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
              />
            )}
            {proSubView === 'triton' && <TritonRacePacer />}
          </section>
        )}

        {/* Tab 4: Fascia Body Map & SMR Guide */}
        {activeTab === 'smr' && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-white/15">
              <button
                onClick={() => setSmrSubView('map')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  smrSubView === 'map'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                1. Fascia & Trigger Point Map
              </button>
              <button
                onClick={() => setSmrSubView('timer')}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  smrSubView === 'timer'
                    ? 'bg-white text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                2. SMR Routine Timer
              </button>
            </div>

            {smrSubView === 'map' ? (
              <FasciaBodyMap onSelectProtocol={handleLaunchProtocolFromMap} />
            ) : (
              <SMRRoutineGuide />
            )}
          </section>
        )}

        {/* Tab 5: Workload & Kinematics */}
        {activeTab === 'analytics' && (
          <section className="space-y-6">
            <InjuryRiskGauge />
            <MetricsTracker />
          </section>
        )}

        {/* Tab 6: Swimmer Journal & Shoulder History */}
        {activeTab === 'journal' && <SwimmerJournal />}

        {/* Tab 7: 100 Research Sources Directory */}
        {activeTab === 'sources' && <ResearchSourcesExplorer />}

        {/* Tab 8: AI Swimmer Intelligence Query Hub */}
        {activeTab === 'ai-coach' && <AICoachChat />}
      </main>

      {/* Footer */}
      <footer className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-white/10 text-center text-xs text-neutral-500 font-mono">
        <p>
          AURASWIM AI • Grounded in Sports Science, Deniz Hekmati SMR Protocols, MoveNet Pose Estimation & 100 Swimming AI/ML Research Studies.
        </p>
      </footer>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Api Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  )
}

export default App
