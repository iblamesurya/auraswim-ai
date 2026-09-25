import { describe, it, expect } from 'vitest'
import {
  parseCommitWorkout,
  ENERGY_ZONE_DEFINITIONS,
} from '../lib/biomechanics/commitWorkoutParser'

describe('Commit Swimming Workout Syntax Parser', () => {
  it('correctly parses total distance and item counts from multi-set practices', () => {
    const workoutText = `
      # Main Test Set
      400 Swim EN1 easy
      10x100 Freestyle on 1:15 EN2 hold pace
      6x50 Butterfly on :55 SP1 ascend/descend
      8x25 Underwater Dolphin Kick on :40 SP3 alactic breakout
      200 Choice recovery EN1
    `
    const result = parseCommitWorkout(workoutText)

    // 400 + (10*100 = 1000) + (6*50 = 300) + (8*25 = 200) + 200 = 2100m
    expect(result.totalDistance).toBe(2100)
    expect(result.itemCount).toBe(5)
  })

  it('correctly maps energy zones and calculates percentages', () => {
    const workoutText = `
      1000 Swim EN1 base
      1000 Freestyle EN2 threshold
    `
    const result = parseCommitWorkout(workoutText)
    expect(result.totalDistance).toBe(2000)
    expect(result.zoneMeters.EN1).toBe(1000)
    expect(result.zoneMeters.EN2).toBe(1000)
    expect(result.zonePercentages.EN1).toBe(50)
    expect(result.zonePercentages.EN2).toBe(50)
    expect(['EN1', 'EN2']).toContain(result.primaryFocusZone)
  })

  it('correctly identifies strokes from text keywords', () => {
    const workoutText = `
      4x50 Fly on :50
      4x50 Back on :55
      4x50 Breast on :55
      4x100 IM on 1:30
      4x50 Kick on 1:00
      4x50 Drill on 1:00
    `
    const result = parseCommitWorkout(workoutText)
    expect(result.items[0].stroke).toBe('Butterfly')
    expect(result.items[1].stroke).toBe('Backstroke')
    expect(result.items[2].stroke).toBe('Breaststroke')
    expect(result.items[3].stroke).toBe('Individual Medley')
    expect(result.items[4].stroke).toBe('Kick')
    expect(result.items[5].stroke).toBe('Technique Drill')
  })

  it('parses intervals and calculates realistic estimated practice duration', () => {
    const workoutText = `
      10x100 Freestyle on 1:30
    `
    const result = parseCommitWorkout(workoutText)
    // 10 reps * 90 seconds = 900s = 15 minutes
    expect(result.estimatedDurationMinutes).toBe(15)
    expect(result.items[0].interval).toBe('1:30')
  })

  it('handles empty input gracefully', () => {
    const result = parseCommitWorkout('')
    expect(result.totalDistance).toBe(0)
    expect(result.itemCount).toBe(0)
    expect(result.items.length).toBe(0)
  })

  it('provides complete energy zone definitions with physiological thresholds', () => {
    expect(ENERGY_ZONE_DEFINITIONS.EN1.name).toContain('Aerobic Recovery')
    expect(ENERGY_ZONE_DEFINITIONS.EN2.lactate).toBe('2.0 - 4.0 mmol/L')
    expect(ENERGY_ZONE_DEFINITIONS.SP2.lactate).toBe('> 9.0 mmol/L')
    expect(ENERGY_ZONE_DEFINITIONS.SP3.purpose).toContain('breakout')
  })

  it('correctly expands nested bracket repetition loops', () => {
    const workoutText = `
      2x [
        4x100 Freestyle on 1:15 EN2
        2x50 Butterfly on :45 SP1
      ]
    `
    const result = parseCommitWorkout(workoutText)
    // 2 * (400 + 100) = 1000m
    expect(result.totalDistance).toBe(1000)
    expect(result.itemCount).toBe(4) // 2 iterations of 2 lines
  })

  it('detects high-torque paddles and calculates mechanical strain AU', () => {
    const workoutText = `
      10x100 Freestyle on 1:20 w/ paddles
    `
    const result = parseCommitWorkout(workoutText)
    expect(result.hasHighTorquePaddles).toBe(true)
    expect(result.gearTagsDetected).toContain('Paddles')
    expect(result.totalMechanicalStrainAU).toBeGreaterThan(0)
  })
})
