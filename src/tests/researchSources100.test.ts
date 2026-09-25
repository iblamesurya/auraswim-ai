import { describe, it, expect } from 'vitest'
import { RESEARCH_SOURCES_100 } from '../lib/data/researchSources100'

describe('RESEARCH_SOURCES_100', () => {
  it('contains exactly 100 unique sources', () => {
    expect(RESEARCH_SOURCES_100.length).toBe(100)
    const uniqueIds = new Set(RESEARCH_SOURCES_100.map((s) => s.id))
    expect(uniqueIds.size).toBe(100)
  })

  it('has non-empty essential metadata for all 100 sources', () => {
    for (const source of RESEARCH_SOURCES_100) {
      expect(source.id).toBeGreaterThanOrEqual(1)
      expect(source.id).toBeLessThanOrEqual(100)
      expect(source.title.trim().length).toBeGreaterThan(5)
      expect(source.authors.trim().length).toBeGreaterThan(2)
      expect(source.venue.trim().length).toBeGreaterThan(2)
      expect(source.summary.trim().length).toBeGreaterThan(15)
      expect(source.takeawayForSwimmer.trim().length).toBeGreaterThan(10)
      expect(source.tags.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('covers all designated swimming science categories', () => {
    const categories = new Set(RESEARCH_SOURCES_100.map((s) => s.category))
    expect(categories.has('Computer Vision')).toBe(true)
    expect(categories.has('Wearables & IMUs')).toBe(true)
    expect(categories.has('Injury Prevention & sEMG')).toBe(true)
    expect(categories.has('Hydrodynamics & CFD')).toBe(true)
    expect(categories.has('Race Analytics')).toBe(true)
    expect(categories.has('Commercial Platforms')).toBe(true)
    expect(categories.has('Load & Digital Twins')).toBe(true)
  })
})
