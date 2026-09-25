import { describe, it, expect } from 'vitest'
import {
  calculateStrokeMetrics,
  predictPacingCorridor,
} from '../lib/biomechanics/swimmingKinematics'

describe('swimmingKinematics', () => {
  it('computes velocity, pace, SR, DPS, and SWOLF for 50m swim', () => {
    // 50m in 30 seconds with 30 strokes
    const metrics = calculateStrokeMetrics(50, 30, 30)

    expect(metrics.velocityMps).toBeCloseTo(1.67, 1)
    expect(metrics.distancePerStrokeMeters).toBeCloseTo(1.67, 1)
    expect(metrics.strokeRateSpm).toBe(60) // (30 strokes / 30 sec) * 60 = 60 spm
    expect(metrics.swolf).toBe(60) // 30s + 30 strokes = 60
    expect(metrics.efficiencyRating).toBe('elite')
  })

  it('handles world-class swim kinematics', () => {
    // 50m in 23 seconds with 28 strokes (sub-60 SWOLF = 51)
    const metrics = calculateStrokeMetrics(50, 23, 28)
    expect(metrics.swolf).toBe(51)
    expect(metrics.efficiencyRating).toBe('world_class')
  })

  it('handles zero or negative inputs safely', () => {
    const metrics = calculateStrokeMetrics(0, 0, 0)
    expect(metrics.velocityMps).toBe(0)
    expect(metrics.swolf).toBe(0)
    expect(metrics.efficiencyRating).toBe('developing')
  })

  it('predicts pacing corridors for 100m race', () => {
    const pacing = predictPacingCorridor(54.0, '100m')
    expect(pacing.firstHalfSplit).toBeLessThan(pacing.secondHalfSplit)
    expect(pacing.targetStrokeRateSpm).toBeGreaterThan(40)
    expect(pacing.pacingStrategy).toContain('Controlled First 50m')
  })

  it('subtracts underwater breakout distance to compute true surface DPS and Stroke Index', () => {
    // 50m pool, 30s split, 30 strokes, with 10m underwater breakout glide
    // Clean distance = 50 - 10 = 40m
    // Clean DPS = 40 / 30 = 1.33m (Raw was 50 / 30 = 1.67m)
    const metrics = calculateStrokeMetrics(50, 30, 30, 10)
    expect(metrics.cleanDpsMeters).toBeCloseTo(1.33, 2)
    expect(metrics.distancePerStrokeMeters).toBeCloseTo(1.67, 2)
    // Stroke Index (SI) = velocity (1.67) * clean DPS (1.33) ≈ 2.22 m²/s
    expect(metrics.strokeIndexM2s).toBeGreaterThan(2.0)
    expect(metrics.idcMode).toBeDefined()
  })
})
