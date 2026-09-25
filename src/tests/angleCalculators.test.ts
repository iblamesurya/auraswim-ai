import { describe, it, expect } from 'vitest'
import {
  calculateAngle,
  calculateEarlyVerticalForearm,
  calculateStreamlineFlexion,
  calculateBilateralAsymmetry,
  calculateStreamlineWithLumbarCompensation,
  calculateEVF3D,
} from '../lib/biomechanics/angleCalculators'

describe('angleCalculators', () => {
  it('correctly calculates 90 degree right angle', () => {
    const a = { x: 0, y: 10 }
    const b = { x: 0, y: 0 }
    const c = { x: 10, y: 0 }
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(90)
  })

  it('correctly calculates 180 degree straight angle', () => {
    const a = { x: -10, y: 0 }
    const b = { x: 0, y: 0 }
    const c = { x: 10, y: 0 }
    const angle = calculateAngle(a, b, c)
    expect(angle).toBe(180)
  })

  it('classifies Early Vertical Forearm (EVF) correctly', () => {
    // 115 degrees = optimal
    const shoulder = { x: 0, y: 100 }
    const elbow = { x: 50, y: 80 }
    const wrist = { x: 60, y: 20 }
    const result = calculateEarlyVerticalForearm(shoulder, elbow, wrist)
    expect(result.status).toBeDefined()
    expect(result.feedback).toBeTypeOf('string')

    // Dropped elbow test (>145 deg)
    const s2 = { x: 0, y: 100 }
    const e2 = { x: 50, y: 50 }
    const w2 = { x: 95, y: 5 }
    const resultDropped = calculateEarlyVerticalForearm(s2, e2, w2)
    expect(resultDropped.status).toBe('dropped_elbow')
  })

  it('classifies streamline flexion correctly', () => {
    const hip = { x: 0, y: 0 }
    const shoulder = { x: 0, y: 100 }
    const wrist = { x: 0, y: 200 }
    const result = calculateStreamlineFlexion(hip, shoulder, wrist)
    expect(result.angle).toBe(180)
    expect(result.status).toBe('excellent')
    expect(result.alignmentScore).toBe(100)
  })

  it('detects compensatory lumbar hyperextension in 4-point streamline test', () => {
    // Ankle, Hip, Lumbar, Shoulder, Wrist
    // Arched lumbar point at x = 180 (30px offset from plumb line x = 150)
    const result = calculateStreamlineWithLumbarCompensation({
      ankle: { x: 150, y: 340 },
      hip: { x: 150, y: 260 },
      lumbar: { x: 180, y: 215 },
      shoulder: { x: 150, y: 170 },
      wrist: { x: 150, y: 30 },
    })

    expect(result.hasLumbarCheat).toBe(true)
    expect(result.status).toBe('lumbar_compensated')
    expect(result.passiveDragPenaltyMultiplier).toBeGreaterThan(1.2)
  })

  it('compensates EVF catch angle for 3D torso roll perspective foreshortening', () => {
    const shoulder = { x: 70, y: 110 }
    const elbow = { x: 160, y: 130 }
    const wrist = { x: 240, y: 190 }

    // 0 deg roll vs 40 deg roll
    const res0 = calculateEVF3D(shoulder, elbow, wrist, 0)
    const res40 = calculateEVF3D(shoulder, elbow, wrist, 40)

    expect(res0.torsoRollDeg).toBe(0)
    expect(res40.torsoRollDeg).toBe(40)
    // 3D corrected angle should account for perspective foreshortening
    expect(res40.corrected3dAngle).toBeLessThanOrEqual(res0.corrected3dAngle)
  })

  it('calculates bilateral asymmetry accurately', () => {
    const balanced = calculateBilateralAsymmetry(1.0, 1.0)
    expect(balanced.asymmetryPercentage).toBe(0)
    expect(balanced.riskLevel).toBe('low')
    expect(balanced.dominantSide).toBe('balanced')

    const asymmetric = calculateBilateralAsymmetry(1.3, 0.9)
    expect(asymmetric.asymmetryPercentage).toBeGreaterThan(15)
    expect(asymmetric.riskLevel).toBe('high')
    expect(asymmetric.dominantSide).toBe('left')
  })
})
