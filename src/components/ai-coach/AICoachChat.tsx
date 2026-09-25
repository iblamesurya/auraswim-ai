import React, { useState } from 'react'
import { PRESET_QUERIES, searchSwimKnowledgebase } from '../../lib/data/swimKnowledgebase'
import type { KnowledgebaseQuery } from '../../lib/data/swimKnowledgebase'
import { Sparkles, Send, BookOpen, User, Bot, Filter } from 'lucide-react'

export const AICoachChat: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedQuery, setSelectedQuery] = useState<KnowledgebaseQuery>(PRESET_QUERIES[0])
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am your **AuraSwim AI Intelligence Assistant**, trained on competitive swimming biomechanics, Coach Deniz Hekmati's self-myofascial release (SMR) protocols, and 100 peer-reviewed swimming research studies.

Ask me anything about your sister's shoulder tightness, stroke rate vs. DPS, training load spikes (ACWR), pre-meet warm-up routines, or tap any of the 12 diagnostic scenarios below!`,
    },
  ])
  const [inputQuery, setInputQuery] = useState('')

  const handleSelectPreset = (q: KnowledgebaseQuery) => {
    setSelectedQuery(q)
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: q.prompt },
      { role: 'assistant', text: q.fullResponse, sources: q.sources },
    ])
  }

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputQuery.trim()) return

    const userText = inputQuery.trim()
    setInputQuery('')

    const result = searchSwimKnowledgebase(userText)
    if (result.matchedPreset) {
      setSelectedQuery(result.matchedPreset)
    }

    setChatHistory((prev) => [
      ...prev,
      { role: 'user', text: userText },
      { role: 'assistant', text: result.reply, sources: result.sources },
    ])
  }

  const filteredQueries =
    selectedCategory === 'all'
      ? PRESET_QUERIES
      : PRESET_QUERIES.filter((q) => q.category === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
                AI SWIMMER INTELLIGENCE HUB
              </span>
              <span className="text-xs text-slate-400">
                Focus: <strong className="text-slate-200">{selectedQuery.title}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              AI Coach & Biomechanics Query Assistant
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Ask deep questions about shoulder pain, stroke mechanics, workout volume spikes, or explore instant diagnostic topics below.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-400">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>100 Sports Science Sources Indexed</span>
          </div>
        </div>
      </div>

      {/* Preset Query Filter & Chips */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            12 Ready-to-Try Query Scenarios:
          </span>
          <div className="flex flex-wrap items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All (12)' },
              { id: 'biomechanics', label: 'Biomechanics' },
              { id: 'injury_prevention', label: 'Injury & SMR' },
              { id: 'training_load', label: 'ACWR Load' },
              { id: 'meet_prep', label: 'Meet Prep' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {filteredQueries.map((q) => (
            <button
              key={q.id}
              onClick={() => handleSelectPreset(q)}
              className="p-3 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-cyan-500/60 hover:bg-slate-800/80 text-left transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {q.title}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {q.category.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{q.previewText}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
        {/* Messages scroll area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap space-y-2">{msg.text}</div>

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <span className="font-semibold text-cyan-400 uppercase tracking-wider block">
                      Cited Literature & Evidence:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {msg.sources.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={handleCustomSend}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask a question (e.g., 'What SMR exercises help with flip-turn push-offs?')"
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
