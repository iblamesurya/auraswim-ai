import { describe, it, expect } from 'vitest'
import {
  calculateACWR,
  calculateSessionRPE,
  calculateFromDailyLoads,
} from '../lib/biomechanics/acwrModel'

describe('acwrModel', () => {
  it('identifies sweet spot zone between 0.8 and 1.3', () => {
    const result = calculateACWR(4000, 4000)
    expect(result.acwr).toBe(1.0)
    expect(result.riskZone).toBe('optimal')
    expect(result.riskLabel).toContain('Sweet Spot')
  })

  it('identifies undertrained zone when ACWR < 0.8', () => {
    const result = calculateACWR(2000, 4000)
    expect(result.acwr).toBe(0.5)
    expect(result.riskZone).toBe('undertrained')
  })

  it('identifies elevated risk when ACWR is between 1.3 and 1.5', () => {
    const result = calculateACWR(5600, 4000)
    expect(result.acwr).toBe(1.4)
    expect(result.riskZone).toBe('elevated_risk')
  })

  it('flags danger zone spike when ACWR > 1.5', () => {
    const result = calculateACWR(7000, 4000)
    expect(result.acwr).toBe(1.75)
    expect(result.riskZone).toBe('danger_zone')
    expect(result.injuryProbability).toContain('High')
  })

  it('computes session RPE correctly', () => {
    // 90 minutes at RPE 7 = 630 AU
    const load = calculateSessionRPE(90, 7)
    expect(load).toBe(630)
  })

  it('handles edge cases gracefully', () => {
    const zeroResult = calculateACWR(3000, 0)
    expect(zeroResult.acwr).toBe(0)
    expect(zeroResult.riskZone).toBe('undertrained')

    const emptyDaily = calculateFromDailyLoads([])
    expect(emptyDaily.acwr).toBe(0)
  })
})
