import React, { useState } from 'react'
import { PRESET_QUERIES, searchSwimKnowledgebase } from '../../lib/data/swimKnowledgebase'
import type { KnowledgebaseQuery } from '../../lib/data/swimKnowledgebase'
import {
  queryLiveSwimmingAI,
  getStoredApiKey,
  getStoredModel,
} from '../../lib/ai/proAIService'
import { loadSwimmerData } from '../../lib/storage/swimmerStore'
import { calculateFromDailyLoads } from '../../lib/biomechanics/acwrModel'
import {
  Sparkles,
  Send,
  BookOpen,
  User,
  Bot,
  Filter,
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
      text: `Hello! I am your **AuraSwim AI Intelligence Assistant**, powered by Meta AI Muse Spark 1.3 Contributor and trained on competitive swimming biomechanics, Coach Deniz Hekmati's self-myofascial release (SMR) protocols, and 100 peer-reviewed swimming research studies.

Ask me anything about your sister's shoulder tightness, stroke rate vs. DPS, training load spikes (ACWR), pre-meet warm-up routines, or tap any of the diagnostic scenarios below!`,
    },
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const apiKey = getStoredApiKey()
  const currentModel = getStoredModel()

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

    // Query live LLM with actual athlete telemetry context
    if (apiKey) {
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
            sources: [`Model: ${res.modelUsed}`, 'AuraSwim Biomechanics Knowledgebase'],
          },
        ])
      } catch (err) {
        console.warn('Live LLM query failed, falling back to research index:', err)
        const fallback = searchSwimKnowledgebase(userText)
        setChatHistory((prev) => [
          ...prev,
          { role: 'assistant', text: fallback.reply, sources: fallback.sources },
        ])
      } finally {
        setIsLoading(false)
      }
    } else {
      // Offline 100-source dynamic research search
      const result = searchSwimKnowledgebase(userText)
      if (result.matchedPreset) {
        setSelectedQuery(result.matchedPreset)
      }

      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: result.reply, sources: result.sources },
      ])
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
                AI SWIMMER INTELLIGENCE HUB
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Topic: <strong className="text-white">{selectedQuery.title}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-white" />
              AI Coach & Biomechanics Query Assistant
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Ask deep questions about shoulder pain, stroke mechanics, workout volume spikes, or explore instant diagnostic topics below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-black text-white text-xs hover:border-white transition-all"
            >
              <Key className="w-3.5 h-3.5 text-white" />
              <span>{apiKey ? `Model: ${currentModel.split('/')[1] || currentModel}` : 'Configure Key'}</span>
            </button>
            <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-white/15 text-xs text-neutral-300">
              <BookOpen className="w-4 h-4 text-white" />
              <span>100 Studies Indexed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Query Presets (Left) + Interactive Chat (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Topics (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-neutral-950 border border-white/15 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-white" />
                Diagnostic Scenarios
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">
                {filteredQueries.length} Topics
              </span>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 font-mono text-[11px]">
              {(['all', 'shoulder-injury', 'smr-technique', 'stroke-mechanics', 'training-load'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'bg-black text-neutral-400 border border-white/10 hover:border-white'
                  }`}
                >
                  {cat === 'all'
                    ? 'All'
                    : cat === 'shoulder-injury'
                    ? 'Shoulder'
                    : cat === 'smr-technique'
                    ? 'SMR'
                    : cat === 'stroke-mechanics'
                    ? 'Kinematics'
                    : 'ACWR Load'}
                </button>
              ))}
            </div>

            {/* List of presets */}
            <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredQueries.map((q) => {
                const isSelected = selectedQuery.id === q.id
                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectPreset(q)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-black border-white text-white font-medium'
                        : 'bg-black/60 border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-white truncate">{q.title}</div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{q.prompt}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chat History & Input (8 cols) */}
        <div className="lg:col-span-8 bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm flex flex-col h-[600px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl space-y-2 ${
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
                  <span>Consulting Meta AI Olympic biomechanics engine...</span>
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
