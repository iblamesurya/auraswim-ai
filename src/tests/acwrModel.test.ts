import { describe, it, expect } from 'vitest'
import {
  calculateACWR,
  calculateSessionRPE,
  calculateFromDailyLoads,
  calculateEWMA_ACWR,
  calculateMechanicalStrain,
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

  it('calculates uncoupled EWMA and flags weekly volume spikes >15%', () => {
    // 7 days of 1000, followed by 7 days of 1300 (+30% increase)
    const dailyLoads = [
      1000, 1000, 1000, 1000, 1000, 1000, 1000, // Week 1 (prev)
      1300, 1300, 1300, 1300, 1300, 1300, 1300, // Week 2 (acute spike)
    ]
    const ewma = calculateEWMA_ACWR(dailyLoads)
    expect(ewma.ewmaAcute).toBeGreaterThan(1150)
    expect(ewma.weekOverWeekChangePercent).toBe(30)
    expect(ewma.weeklySpikeAlert).toBe(true)
  })

  it('calculates stroke and equipment mechanical strain multipliers', () => {
    const freeLoad = calculateMechanicalStrain({ volumeMeters: 1000, rpe1to10: 7, stroke: 'freestyle' })
    const flyPaddleLoad = calculateMechanicalStrain({ volumeMeters: 1000, rpe1to10: 7, stroke: 'butterfly', equipment: 'paddles' })
    // Fly (1.6) x Paddles (1.35) = 2.16x higher joint torque
    expect(flyPaddleLoad).toBeGreaterThan(freeLoad * 2.0)
  })
})
