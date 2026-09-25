import { describe, it, expect } from 'vitest'
import {
  PRESET_QUERIES,
  searchSwimKnowledgebase,
} from '../lib/data/swimKnowledgebase'

describe('swimKnowledgebase & AI Query Assistant', () => {
  it('contains at least 12 distinct competitive swimming preset queries', () => {
    expect(PRESET_QUERIES.length).toBeGreaterThanOrEqual(12)
    const categories = new Set(PRESET_QUERIES.map((q) => q.category))
    expect(categories.has('injury_prevention')).toBe(true)
    expect(categories.has('biomechanics')).toBe(true)
    expect(categories.has('training_load')).toBe(true)
    expect(categories.has('meet_prep')).toBe(true)
  })

  it('matches direct preset query by title or topic', () => {
    const res = searchSwimKnowledgebase('shoulder pinching butterfly')
    expect(res.reply).toContain('Pec Minor')
    expect(res.reply).toContain('Subscapularis')
    expect(res.sources.length).toBeGreaterThan(0)
  })

  it('retrieves scientific guidance for underwater dolphin kick breakout depth', () => {
    const res = searchSwimKnowledgebase('underwater dolphin kick breakout depth')
    expect(res.reply).toContain('0.9m to 1.2m')
    expect(res.reply).toContain('wave drag')
  })

  it('retrieves scientific guidance for dropped elbow on breathing side', () => {
    const res = searchSwimKnowledgebase('dropped elbow breathing side')
    expect(res.reply).toContain('One-Goggle Breathing Rule')
    expect(res.reply).toContain('snorkel')
  })

  it('retrieves scientific guidance for flip turn tuck physics', () => {
    const res = searchSwimKnowledgebase('flip turn speed tuck radius')
    expect(res.reply).toContain('moment of inertia')
  })

  it('matches computer vision preset for YOLO and IMU technology comparison', () => {
    const res = searchSwimKnowledgebase('YOLO pose estimation vs wearable IMU')
    expect(res.reply).toContain('Technology Comparison')
    expect(res.sources.length).toBeGreaterThan(0)
  })

  it('dynamically queries 100 research sources when given specialized deep studies', () => {
    const res = searchSwimKnowledgebase('Viterbi algorithm anchor pose cyclic kinematics')
    expect(res.reply).toContain('Evidence-Grounded Research Analysis')
    expect(res.sources.length).toBeGreaterThan(0)
  })

  it('dynamically finds sEMG muscle activation papers from the 100 sources', () => {
    const res = searchSwimKnowledgebase('sEMG muscle activation supraspinatus latissimus')
    expect(res.reply).toContain('Evidence-Grounded Research Analysis')
    expect(res.sources.length).toBeGreaterThan(0)
  })
})
