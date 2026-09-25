import React, { useState, useMemo } from 'react'
import { RESEARCH_SOURCES_100 } from '../../lib/data/researchSources100'
import type { ResearchSource } from '../../lib/data/researchSources100'
import { Search, BookOpen, ExternalLink, Filter, Sparkles, Tag, CheckCircle2 } from 'lucide-react'

export const ResearchSourcesExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedSource, setSelectedSource] = useState<ResearchSource | null>(null)

  const categories = [
    'All',
    'Computer Vision',
    'Wearables & IMUs',
    'Injury Prevention & sEMG',
    'Hydrodynamics & CFD',
    'Race Analytics',
    'Commercial Platforms',
    'Load & Digital Twins',
  ]

  const filteredSources = useMemo(() => {
    return RESEARCH_SOURCES_100.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.authors.toLowerCase().includes(query) ||
        item.venue.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.takeawayForSwimmer.toLowerCase().includes(query) ||
        item.tags.some((t) => t.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
              OFFICIAL RESEARCH DATABASE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              100 AI & Machine Learning Sources in Competitive Swimming
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              An exhaustive, curated library of 100 peer-reviewed research papers, sports science experiments, commercial platforms, and computational fluid dynamics (CFD) models powering modern swimming.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              Showing <strong className="text-cyan-400 font-mono">{filteredSources.length}</strong> of 100 Sources
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 100 sources (e.g., 'EVF catch', 'subscapularis', 'TritonWear', 'CFD', 'impingement')..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedSource(item)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-[10px] font-bold text-cyan-400 flex items-center justify-center font-mono">
                  #{item.id}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {item.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                {item.title}
              </h3>

              <div className="text-xs text-slate-400">
                <span>{item.authors}</span> • <span className="text-slate-500 font-mono">{item.year}</span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-start gap-1.5 text-[11px] text-emerald-300/90 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.takeawayForSwimmer}</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-cyan-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Source Detail Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                    Source #{selectedSource.id}
                  </span>
                  <span className="text-xs text-slate-400 uppercase font-semibold">
                    {selectedSource.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-snug">
                  {selectedSource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block">Authors:</span>
                  <strong className="text-slate-200">{selectedSource.authors}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Published In:</span>
                  <strong className="text-slate-200">
                    {selectedSource.venue} ({selectedSource.year})
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Scientific Methodology & Summary:
                </span>
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {selectedSource.summary}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60">
                <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider block mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Practical Value for Your Sister & Coach:
                </span>
                <p className="text-emerald-200 leading-relaxed">
                  {selectedSource.takeawayForSwimmer}
                </p>
              </div>

              {selectedSource.doiOrLink && (
                <div className="pt-2">
                  <a
                    href={selectedSource.doiOrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold transition-colors"
                  >
                    <span>View Official Publication / Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
