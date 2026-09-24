export interface SwimKinematicsResult {
  velocityMps: number
  pacePer100mSec: number
  strokeRateSpm: number // strokes per minute
  distancePerStrokeMeters: number // DPS
  swolf: number // strokes + seconds per 50m
  efficiencyRating: 'world_class' | 'elite' | 'club_competitive' | 'developing'
  efficiencyLabel: string
  color: string
}

/**
 * Calculates competitive swimming kinematics from pool length, split time, and stroke count
 */
export function calculateStrokeMetrics(
  distanceMeters: number,
  timeSeconds: number,
  strokeCount: number
): SwimKinematicsResult {
  if (distanceMeters <= 0 || timeSeconds <= 0 || strokeCount <= 0) {
    return {
      velocityMps: 0,
      pacePer100mSec: 0,
      strokeRateSpm: 0,
      distancePerStrokeMeters: 0,
      swolf: 0,
      efficiencyRating: 'developing',
      efficiencyLabel: 'Invalid Inputs',
      color: 'text-slate-400',
    }
  }

  // Velocity (m/s)
  const velocityMps = Math.round((distanceMeters / timeSeconds) * 100) / 100

  // Pace per 100m in seconds
  const pacePer100mSec = Math.round((timeSeconds / distanceMeters) * 100 * 10) / 10

  // Distance Per Stroke (DPS) in meters
  const distancePerStrokeMeters =
    Math.round((distanceMeters / strokeCount) * 100) / 100

  // Stroke Rate (strokes per minute) = (strokes / seconds) * 60
  const strokeRateSpm = Math.round((strokeCount / timeSeconds) * 60 * 10) / 10

  // SWOLF for 50m normalized: (Time for 50m) + (Strokes for 50m)
  const normalized50mTime = (timeSeconds / distanceMeters) * 50
  const normalized50mStrokes = (strokeCount / distanceMeters) * 50
  const swolf = Math.round(normalized50mTime + normalized50mStrokes)

  let efficiencyRating: SwimKinematicsResult['efficiencyRating'] = 'developing'
  let efficiencyLabel = 'Developing Technical Base'
  let color = 'text-sky-400'

  if (swolf < 60) {
    efficiencyRating = 'world_class'
    efficiencyLabel = 'World-Class Efficiency (Sub-60 SWOLF)'
    color = 'text-purple-400'
  } else if (swolf <= 70) {
    efficiencyRating = 'elite'
    efficiencyLabel = 'National / Elite Tier (60-70 SWOLF)'
    color = 'text-emerald-400'
  } else if (swolf <= 85) {
    efficiencyRating = 'club_competitive'
    efficiencyLabel = 'Strong Club Competitive (71-85 SWOLF)'
    color = 'text-cyan-400'
  }

  return {
    velocityMps,
    pacePer100mSec,
    strokeRateSpm,
    distancePerStrokeMeters,
    swolf,
    efficiencyRating,
    efficiencyLabel,
    color,
  }
}

/**
 * Pacing Corridor Calculator based on nonlinear SR x SL interaction
 */
export function predictPacingCorridor(
  targetTimeSeconds: number,
  event: '50m' | '100m' | '200m' | '400m'
): {
  firstHalfSplit: number
  secondHalfSplit: number
  targetStrokeRateSpm: number
  targetDpsMeters: number
  pacingStrategy: string
} {
  switch (event) {
    case '50m':
      return {
        firstHalfSplit: Math.round(targetTimeSeconds * 0.48 * 10) / 10,
        secondHalfSplit: Math.round(targetTimeSeconds * 0.52 * 10) / 10,
        targetStrokeRateSpm: 52,
        targetDpsMeters: 1.85,
        pacingStrategy:
          'Maximal Rate & Early Turnover: High tempo breakout, zero breathing inside first 15m, sustain kick power through finish.',
      }
    case '100m':
      return {
        firstHalfSplit: Math.round((targetTimeSeconds * 0.47) * 10) / 10,
        secondHalfSplit: Math.round((targetTimeSeconds * 0.53) * 10) / 10,
        targetStrokeRateSpm: 46,
        targetDpsMeters: 2.05,
        pacingStrategy:
          'Controlled First 50m with 1.0 - 1.5s Differential: Open easy speed without spiking lactic acid, build stroke tempo over the final 35m.',
      }
    case '200m':
      return {
        firstHalfSplit: Math.round((targetTimeSeconds * 0.485) * 10) / 10,
        secondHalfSplit: Math.round((targetTimeSeconds * 0.515) * 10) / 10,
        targetStrokeRateSpm: 38,
        targetDpsMeters: 2.2,
        pacingStrategy:
          'Descend Build Strategy: 1st 50m easy speed, 2nd 50m lock cadence, 3rd 50m push leg tempo, 4th 50m all-out sprint.',
      }
    case '400m':
      return {
        firstHalfSplit: Math.round((targetTimeSeconds * 0.495) * 10) / 10,
        secondHalfSplit: Math.round((targetTimeSeconds * 0.505) * 10) / 10,
        targetStrokeRateSpm: 34,
        targetDpsMeters: 2.3,
        pacingStrategy:
          'Even-Paced Aerobic Economy: High Distance Per Stroke (DPS), steady 2-beat or 4-beat kick with high 6-beat tempo reserve for final 75m.',
      }
  }
}
