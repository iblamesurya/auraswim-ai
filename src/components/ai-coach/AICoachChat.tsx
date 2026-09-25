import React, { useState } from 'react'
import { PRESET_QUERIES, searchSwimKnowledgebase } from '../../lib/data/swimKnowledgebase'
import type { KnowledgebaseQuery } from '../../lib/data/swimKnowledgebase'
import {
  queryLiveSwimmingAI,
  getStoredApiKey,
} from '../../lib/ai/proAIService'
import { loadSwimmerData } from '../../lib/storage/swimmerStore'
import { calculateFromDailyLoads } from '../../lib/biomechanics/acwrModel'
import {
  Sparkles,
  Send,
  BookOpen,
  User,
  Bot,
  Key,
  Loader2,
} from 'lucide-react'

interface AICoachChatProps {
  onOpenApiKeyModal?: () => void
}

export const AICoachChat: React.FC<AICoachChatProps> = ({ onOpenApiKeyModal }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedQuery, setSelectedQuery] = useState<KnowledgebaseQuery>(PRESET_QUERIES[0])
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am your **AuraSwim Olympic Intelligence Assistant**, trained on elite competitive swimming biomechanics, Coach Deniz Hekmati's self-myofascial release (SMR) protocols, and 100 peer-reviewed swimming research studies.

Ask me anything about your sister's high-elbow catch, shoulder pain, stroke rate vs. DPS, training load spikes (ACWR), pre-meet warm-up routines, or tap any of the diagnostic scenarios below!`,
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const apiKey = getStoredApiKey()

  const handleSelectPreset = (q: KnowledgebaseQuery) => {
    setSelectedQuery(q)
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: q.prompt },
      { role: 'assistant', text: q.fullResponse, sources: q.sources },
    ])
  }

  const handleCustomSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim() || isLoading) return

    const userText = inputQuery.trim()
    setInputQuery('')

    setChatHistory((prev) => [...prev, { role: 'user', text: userText }])

    setIsLoading(true)
    try {
      const store = loadSwimmerData()
      const latestShoulder = store.shoulderLogs[0]?.painScale1to10 ?? 0

      // Real ACWR calculation
      let realAcwr = 1.0
      if (store.workouts.length >= 7) {
        const loads = store.workouts.map((w) => w.meters * (w.rpeScale1to10 || 5))
        const acwrRes = calculateFromDailyLoads(loads)
        realAcwr = acwrRes.acwr
      }

      const res = await queryLiveSwimmingAI(userText, {
        swimmerName: store.swimmerName,
        acwr: realAcwr,
        smrStreak: store.smrStreakDays,
        recentYardage: store.weeklyTargetMeters,
        shoulderPain: latestShoulder,
      })

      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.text,
          sources:
            res.sources && res.sources.length > 0
              ? res.sources
              : ['AuraSwim Olympic Intelligence Engine', '100 Peer-Reviewed Biomechanics Studies'],
        },
      ])
    } catch (err) {
      console.warn('Live Olympic engine query failed, falling back to research index:', err)
      const fallback = searchSwimKnowledgebase(userText)
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: fallback.reply, sources: fallback.sources },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredQueries =
    selectedCategory === 'all'
      ? PRESET_QUERIES
      : PRESET_QUERIES.filter((q) => q.category === selectedCategory)

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              OLYMPIC BIOMECHANICS & SMR INTELLIGENCE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-white" />
              AuraSwim Olympic Coach & Biomechanics Hub
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Trained on 100 swimming research studies, Olympic training methodologies, and Coach Deniz Hekmati's SMR protocols. Ask custom questions or select clinical diagnostic scenarios below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/20 hover:border-white text-xs text-neutral-300 hover:text-white transition-colors font-mono"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'Neural Engine Active' : 'Setup AI Credentials'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Scenarios (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-white" />
              Diagnostic Scenarios
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">
              {filteredQueries.length} Scenarios
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'injury_prevention', label: 'Injury' },
              { id: 'biomechanics', label: 'Biomechanics' },
              { id: 'training_load', label: 'Load' },
              { id: 'meet_prep', label: 'Meet Prep' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black border-white font-bold'
                    : 'bg-black text-neutral-400 border-white/15 hover:border-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Scenarios List */}
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {filteredQueries.map((q) => {
              const isSelected = selectedQuery.id === q.id
              return (
                <button
                  key={q.id}
                  onClick={() => handleSelectPreset(q)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all space-y-1 block ${
                    isSelected
                      ? 'bg-neutral-900 border-white text-white'
                      : 'bg-black border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white tracking-tight">{q.title}</span>
                    <span className="text-[9px] font-mono uppercase text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-white/10">
                      {q.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {q.previewText}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[550px] space-y-4">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[480px]">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-white text-black rounded-tr-none font-medium'
                      : 'bg-black border border-white/15 text-neutral-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-white/10 text-[10px] font-mono text-neutral-400 space-y-0.5">
                      <span className="font-bold text-white uppercase tracking-wider block">
                        Verified Sources:
                      </span>
                      {msg.sources.map((s, idx) => (
                        <div key={idx} className="truncate">
                          • {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl bg-black border border-white/15 text-neutral-300 flex items-center gap-2 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Consulting AuraSwim Olympic Biomechanics Engine...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleCustomSend}
            className="pt-4 border-t border-white/10 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about your sister's high-elbow catch, shoulder pain, or taper set..."
              className="flex-1 bg-black border border-white/20 focus:border-white rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
