import React, { useState, useMemo } from 'react'
import { RESEARCH_SOURCES_100 } from '../../lib/data/researchSources100'
import type { ResearchSource } from '../../lib/data/researchSources100'
import { Search, BookOpen, ExternalLink, Filter, Sparkles, Tag, CheckCircle2, X } from 'lucide-react'

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
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              OFFICIAL RESEARCH DATABASE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 flex items-center gap-2 tracking-tight">
              <BookOpen className="w-5 h-5 text-white" />
              100 AI & Machine Learning Sources in Competitive Swimming
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl">
              An exhaustive, curated library of 100 peer-reviewed research papers, sports science experiments, commercial platforms, and computational fluid dynamics (CFD) models powering modern swimming.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-xl border border-white/15 text-xs text-neutral-300 flex-shrink-0 font-mono">
            <Sparkles className="w-4 h-4 text-white" />
            <span>
              Showing <strong className="text-white">{filteredSources.length}</strong> of 100 Sources
            </span>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3 bg-neutral-950 border border-white/15 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 100 sources (e.g., 'EVF catch', 'subscapularis', 'TritonWear', 'CFD', 'impingement')..."
            className="w-full bg-black border border-white/15 focus:border-white rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-mono">
          <Filter className="w-3.5 h-3.5 text-neutral-500 mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-black font-semibold'
                  : 'bg-black text-neutral-400 hover:text-white border border-white/10'
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
            className="p-4 rounded-2xl bg-neutral-950 border border-white/15 hover:border-white transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="w-6 h-6 rounded-md bg-black border border-white/20 text-[10px] font-bold text-white flex items-center justify-center font-mono">
                  #{item.id}
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black text-neutral-300 border border-white/10">
                  {item.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white transition-colors line-clamp-2">
                {item.title}
              </h3>

              <div className="text-xs text-neutral-400">
                <span>{item.authors}</span> • <span className="text-neutral-500 font-mono">{item.year}</span>
              </div>

              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <div className="flex items-start gap-1.5 text-[11px] text-neutral-200 bg-black p-2 rounded-lg border border-white/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-white flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.takeawayForSwimmer}</span>
              </div>

              <div className="flex flex-wrap gap-1 font-mono">
                {item.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-black text-neutral-400 border border-white/10 flex items-center gap-1"
                  >
                    <Tag className="w-2.5 h-2.5 text-white" />
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase">
                  SOURCE #{selectedSource.id} • {selectedSource.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSource.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSource(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-400 font-mono">
                <span>{selectedSource.authors}</span> • <span>{selectedSource.venue} ({selectedSource.year})</span>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-white/15 space-y-1">
                <span className="font-bold text-white block uppercase text-[10px] font-mono">
                  Study Methodology & Findings:
                </span>
                <p className="text-neutral-300 leading-relaxed font-sans text-xs">
                  {selectedSource.summary}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black border border-white/20 space-y-1">
                <span className="font-bold text-white block uppercase text-[10px] font-mono">
                  Direct Translation to Swimmer:
                </span>
                <p className="text-white leading-relaxed font-sans text-xs">
                  {selectedSource.takeawayForSwimmer}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 font-mono pt-2">
                {selectedSource.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-black text-neutral-300 border border-white/15"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {selectedSource.doiOrLink && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <a
                    href={selectedSource.doiOrLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Primary Publication</span>
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
