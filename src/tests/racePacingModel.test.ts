import { describe, it, expect } from 'vitest'
import {
  generateOlympicRacePacing,
  formatSwimTime,
} from '../lib/biomechanics/racePacingModel'

describe('TritonWear & Omega ARES Race Pacing Model', () => {
  it('formats swim times accurately for sub-minute and multi-minute marks', () => {
    expect(formatSwimTime(24.32)).toBe('24.32s')
    expect(formatSwimTime(53.04)).toBe('53.04s')
    expect(formatSwimTime(65.12)).toBe('1:05.12')
    expect(formatSwimTime(124.8)).toBe('2:04.80')
  })

  it('generates accurate 100m LCM Olympic pacing with 2 clean 50m splits', () => {
    const pacing = generateOlympicRacePacing({
      distance: 100,
      stroke: 'Freestyle',
      targetTimeSeconds: 52.0,
      strategy: 'aggressive_front',
      course: 'LCM',
    })

    expect(pacing.eventName).toBe('100 Freestyle')
    expect(pacing.course).toBe('LCM')
    expect(pacing.laps.length).toBe(2)
    // Sum of splits should equal target time
    const totalSplit = pacing.laps[0].splitSeconds + pacing.laps[1].splitSeconds
    expect(Math.abs(totalSplit - 52.0)).toBeLessThan(0.1)
    // Lap 1 is faster due to dive start
    expect(pacing.laps[0].splitSeconds).toBeLessThan(pacing.laps[1].splitSeconds)
    expect(pacing.strokeIndex).toBeGreaterThan(0)
    expect(pacing.reactionTimeSeconds).toBe(0.64)
  })

  it('generates 100y SCY with 4 x 25 splits and turn contact metrics', () => {
    const pacing = generateOlympicRacePacing({
      distance: 100,
      stroke: 'Freestyle',
      targetTimeSeconds: 46.5,
      strategy: 'even_pace',
      course: 'SCY',
    })

    expect(pacing.laps.length).toBe(4)
    expect(pacing.laps[1].turnContactSeconds).toBe(0.27)
    expect(pacing.pacingDifferentialSeconds).toBeDefined()
  })

  it('generates 200m race splits with 4 lap breakdown and tactical pacing advice', () => {
    const pacing = generateOlympicRacePacing({
      distance: 200,
      stroke: 'Freestyle',
      targetTimeSeconds: 114.0, // 1:54.00
      strategy: 'negative_split',
      course: 'LCM',
    })

    expect(pacing.laps.length).toBe(4)
    const sumSplits = pacing.laps.reduce((acc, l) => acc + l.splitSeconds, 0)
    expect(Math.abs(sumSplits - 114.0)).toBeLessThan(0.2)
    expect(pacing.coachPacingAdvice).toBeDefined()
    expect(pacing.coachPacingAdvice.length).toBeGreaterThan(10)
  })

  it('calculates average stroke rate, DPS and stroke index', () => {
    const pacing = generateOlympicRacePacing({
      distance: 50,
      stroke: 'Freestyle',
      targetTimeSeconds: 22.0,
      strategy: 'aggressive_front',
    })

    expect(pacing.averageStrokeRate).toBeGreaterThan(30)
    expect(pacing.averageDps).toBeGreaterThan(1.0)
    expect(pacing.strokeIndex).toBeGreaterThan(1.0)
  })
})
