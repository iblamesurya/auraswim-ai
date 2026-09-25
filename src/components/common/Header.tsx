import React from 'react'
import { Activity, Waves, Sparkles, ShieldCheck, BookOpen, Calendar, HeartPulse, Key, Gauge } from 'lucide-react'
import { getStoredApiKey } from '../../lib/ai/proAIService'

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onOpenApiKeyModal: () => void
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenApiKeyModal }) => {
  const apiKey = getStoredApiKey()
  const isKeyActive = Boolean(apiKey && apiKey.length > 5)

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('schedule')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <Waves className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                AURASWIM
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-white/10 text-white rounded border border-white/20 hidden sm:inline">
                PRO SUITE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden sm:block">
              Kinematics, SMR & Olympic Performance
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Camera
          </button>
          <button
            onClick={() => setActiveTab('pro-suite')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pro-suite'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Pro Suite
          </button>
          <button
            onClick={() => setActiveTab('smr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'smr'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            Fascia & SMR
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Load & ACWR
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'journal'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Journal
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'sources'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            100 Sources
          </button>
          <button
            onClick={() => setActiveTab('ai-coach')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'ai-coach'
                ? 'bg-white text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            AI Coach
          </button>
        </nav>

        {/* Right Controls: Meta AI Key & Engine Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenApiKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/20 text-white text-xs hover:border-white transition-all"
            title="Configure Meta AI & LLM Engine"
          >
            <Key className="w-3.5 h-3.5 text-white" />
            <span className="font-mono text-[11px] hidden sm:inline">Meta AI</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isKeyActive ? 'bg-white' : 'bg-neutral-600'}`} />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950 border border-white/10 text-neutral-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>MoveNet Vision</span>
          </div>
        </div>
      </div>
    </header>
  )
}
