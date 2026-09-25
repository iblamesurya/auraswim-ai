export interface SwimKinematicsResult {
  velocityMps: number
  pacePer100mSec: number
  strokeRateSpm: number // strokes per minute
  distancePerStrokeMeters: number // Raw DPS
  cleanDpsMeters: number // True surface DPS after underwater breakout subtraction
  strokeIndexM2s: number // Gold standard Stroke Index (v * DPS) in m^2/s (Costill et al.)
  swolf: number // strokes + seconds per 50m
  efficiencyRating: 'world_class' | 'elite' | 'club_competitive' | 'developing'
  efficiencyLabel: string
  color: string
  idcMode?: 'catch_up' | 'opposition' | 'superposition' // Index of Coordination (Chollet et al.)
  idcDescription?: string
}

/**
 * Calculates competitive swimming kinematics from pool length, split time, and stroke count.
 * Enhanced with Olympic underwater breakout distance subtraction and Stroke Index (Costill et al., 1985).
 */
export function calculateStrokeMetrics(
  distanceMeters: number,
  timeSeconds: number,
  strokeCount: number,
  underwaterBreakoutMeters: number = 0
): SwimKinematicsResult {
  if (distanceMeters <= 0 || timeSeconds <= 0 || strokeCount <= 0) {
    return {
      velocityMps: 0,
      pacePer100mSec: 0,
      strokeRateSpm: 0,
      distancePerStrokeMeters: 0,
      cleanDpsMeters: 0,
      strokeIndexM2s: 0,
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

  // Raw Distance Per Stroke (DPS) in meters
  const distancePerStrokeMeters =
    Math.round((distanceMeters / strokeCount) * 100) / 100

  // True Surface Clean Distance Per Stroke (subtracting underwater glide breakout)
  const cleanDistance = Math.max(1, distanceMeters - underwaterBreakoutMeters)
  const cleanDpsMeters = Math.round((cleanDistance / strokeCount) * 100) / 100

  // Stroke Rate (strokes per minute) = (strokes / seconds) * 60
  const strokeRateSpm = Math.round((strokeCount / timeSeconds) * 60 * 10) / 10

  // Stroke Index (SI) = Velocity * Clean DPS (units: m^2/s)
  // Highly correlated with VO2 max efficiency and aerobic economy (Costill et al.)
  const strokeIndexM2s = Math.round(velocityMps * cleanDpsMeters * 100) / 100

  // Index of Coordination (IdC) estimation based on stroke rate and velocity
  let idcMode: SwimKinematicsResult['idcMode'] = 'opposition'
  let idcDescription = 'Opposition Mode (IdC ≈ 0%): Propulsive phases alternate continuously without lag.'
  if (strokeRateSpm < 38) {
    idcMode = 'catch_up'
    idcDescription = 'Catch-up Mode (IdC < 0%): Glide latency between arm propulsions. Common in distance/recovery.'
  } else if (strokeRateSpm > 48) {
    idcMode = 'superposition'
    idcDescription = 'Superposition Mode (IdC > 0%): Overlapping propulsive forces. Maximizes peak sprint power.'
  }

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
    cleanDpsMeters,
    strokeIndexM2s,
    swolf,
    efficiencyRating,
    efficiencyLabel,
    color,
    idcMode,
    idcDescription,
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
