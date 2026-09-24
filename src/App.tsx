import { useState } from 'react'
import { Header } from './components/common/Header'
import { MobileNav } from './components/common/MobileNav'
import { PoseCamera } from './components/camera/PoseCamera'
import { SMRRoutineGuide } from './components/smr/SMRRoutineGuide'
import { TrainingScheduler } from './components/dashboard/TrainingScheduler'
import { InjuryRiskGauge } from './components/dashboard/InjuryRiskGauge'
import { MetricsTracker } from './components/dashboard/MetricsTracker'
import { AICoachChat } from './components/ai-coach/AICoachChat'
import {
  Waves,
  ShieldCheck,
  Flame,
  Sparkles,
} from 'lucide-react'

export function App() {
  const [activeTab, setActiveTab] = useState<string>('schedule')

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black pb-20 md:pb-8">
      {/* Top Sticky Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Swimmer Status Bar */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white">Competitive Swimmer Profile</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 rounded-full border border-emerald-800">
                  Ready to Train
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Weekly Volume: 36,000m • Shoulder Health: Optimal (ACWR 1.20)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">SMR Streak:</span>
              <strong className="text-amber-400 font-mono">14 Days</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Shoulder Risk:</span>
              <strong className="text-emerald-400">Low (Sweet Spot)</strong>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Vision Mode:</span>
              <strong className="text-cyan-400">EVF + Streamline</strong>
            </div>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === 'schedule' && (
          <TrainingScheduler onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'camera' && (
          <section className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                AI Computer Vision & Kinematic Analysis
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Runs local client-side computer vision to assess overhead streamline flexion, early vertical forearm (EVF) catch angles, and bilateral arm pull symmetry.
              </p>
            </div>
            <PoseCamera />
          </section>
        )}

        {activeTab === 'smr' && <SMRRoutineGuide />}

        {activeTab === 'analytics' && (
          <section className="space-y-6">
            <InjuryRiskGauge />
            <MetricsTracker />
          </section>
        )}

        {activeTab === 'ai-coach' && <AICoachChat />}
      </main>

      {/* Footer */}
      <footer className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>
          AuraSwim AI • Grounded in Sports Science, Deniz Hekmati SMR Protocols & 100 Swimming AI/ML Research Studies.
        </p>
      </footer>

      {/* Mobile Sticky Bottom Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default App
