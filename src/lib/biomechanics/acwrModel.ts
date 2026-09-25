export interface ACWRResult {
  acuteLoad: number
  chronicLoad: number
  acwr: number
  riskZone: 'undertrained' | 'optimal' | 'elevated_risk' | 'danger_zone'
  riskLabel: string
  color: string
  injuryProbability: string
  coachingRecommendation: string
  // Olympic enhancements
  ewmaAcute?: number
  ewmaChronic?: number
  uncoupledAcwr?: number
  weekOverWeekChangePercent?: number
  weeklySpikeAlert?: boolean
}

/**
 * Calculates Acute-to-Chronic Workload Ratio (ACWR)
 * - Acute Load: Recent 7 days of training stress (volume x intensity)
 * - Chronic Load: Rolling average of past 28 days of training stress
 * Standard Gabbett Sports Science model widely applied in competitive swimming.
 */
export function calculateACWR(acuteLoad: number, chronicLoad: number): ACWRResult {
  if (chronicLoad <= 0) {
    return {
      acuteLoad,
      chronicLoad: 0,
      acwr: 0,
      riskZone: 'undertrained',
      riskLabel: 'Insufficient Baseline',
      color: 'text-slate-400',
      injuryProbability: 'Unknown',
      coachingRecommendation:
        'Log at least 2 to 4 weeks of consistent swim meterage to establish a chronic training baseline.',
    }
  }

  const rawAcwr = acuteLoad / chronicLoad
  const acwr = Math.round(rawAcwr * 100) / 100

  if (acwr < 0.8) {
    return {
      acuteLoad,
      chronicLoad,
      acwr,
      riskZone: 'undertrained',
      riskLabel: 'Under-Prepared / Low Load',
      color: 'text-sky-400',
      injuryProbability: 'Low (but fitness decaying)',
      coachingRecommendation:
        'Training load has dropped significantly. While acute injury risk is low, rapid spikes next week could trigger shoulder pain. Maintain steady dryland & technique work.',
    }
  }

  if (acwr >= 0.8 && acwr <= 1.3) {
    return {
      acuteLoad,
      chronicLoad,
      acwr,
      riskZone: 'optimal',
      riskLabel: 'The "Sweet Spot"',
      color: 'text-emerald-400',
      injuryProbability: 'Minimal (~2 - 4%)',
      coachingRecommendation:
        'Optimal training zone! Excellent balance between high conditioning gains and minimal shoulder injury risk. Continue standard pre-swim SMR protocols.',
    }
  }

  if (acwr > 1.3 && acwr <= 1.5) {
    return {
      acuteLoad,
      chronicLoad,
      acwr,
      riskZone: 'elevated_risk',
      riskLabel: 'Elevated Risk / Overreaching',
      color: 'text-amber-400',
      injuryProbability: 'Elevated (~10 - 15%)',
      coachingRecommendation:
        'Training load is spiking faster than physiological adaptations. Swimmer may experience tight pecs and anterior shoulder ache. Double down on subscapularis and pec minor SMR daily.',
    }
  }

  return {
    acuteLoad,
    chronicLoad,
    acwr,
    riskZone: 'danger_zone',
    riskLabel: 'Danger Zone / High Injury Spike',
    color: 'text-rose-400',
    injuryProbability: 'High (> 25 - 40%)',
    coachingRecommendation:
      'CRITICAL: Training volume/intensity has spiked more than 50% above baseline. High probability of rotator cuff tendinopathy or swimmer shoulder impingement. Reduce yardage, eliminate paddles, and schedule soft-tissue recovery.',
  }
}

/**
 * Calculates session training load in Arbitrary Units (AU)
 * using Borg CR-10 Session RPE (Foster et al., 2001)
 */
export function calculateSessionRPE(durationMinutes: number, rpeScore1to10: number): number {
  const clampedRpe = Math.max(1, Math.min(10, rpeScore1to10))
  return Math.round(durationMinutes * clampedRpe)
}

/**
 * Stroke and Equipment Musculoskeletal Strain Multipliers
 * Incorporates glenohumeral shear torque factors (Pink et al., 1991; Sein et al., 2010).
 */
export const STROKE_STRAIN_MULTIPLIERS: Record<string, number> = {
  butterfly: 1.6, // High bilateral hyperextension torque
  breaststroke: 1.2, // Adductor strain & moderate shoulder internal rotation
  backstroke: 1.1, // Clean recovery angle, moderate rotator cuff load
  freestyle: 1.0, // Baseline cyclic load
  im: 1.3, // Mixed stroke distribution
  kick: 0.5, // Shoulder offloaded
  pull: 1.15, // Upper body isolation
}

export const EQUIPMENT_STRAIN_MULTIPLIERS: Record<string, number> = {
  paddles: 1.35, // Increases propulsive surface area and rotator cuff torque by 35%
  chute: 1.40, // High passive resistance drag
  buoy: 1.10, // Upper body pull isolation
  fins: 0.85, // Offloads upper body, transfers load to ankles/plantar fascia
  snorkel: 0.95, // Eliminates breathing head-turn cervical torque
  none: 1.0,
}

export function calculateMechanicalStrain(params: {
  volumeMeters: number
  rpe1to10: number
  stroke?: string
  equipment?: string
}): number {
  const { volumeMeters, rpe1to10, stroke = 'freestyle', equipment = 'none' } = params
  const strokeKey = stroke.toLowerCase()
  const gearKey = equipment.toLowerCase()

  const sMult = STROKE_STRAIN_MULTIPLIERS[strokeKey] || 1.0
  const gMult = EQUIPMENT_STRAIN_MULTIPLIERS[gearKey] || 1.0

  const baseLoad = (volumeMeters / 100) * (rpe1to10 / 10) * 10
  return Math.round(baseLoad * sMult * gMult)
}

/**
 * Uncoupled Exponentially Weighted Moving Average (EWMA) ACWR
 * Eliminates the coupling artifact and rolling cliff effect (Gabbett, 2016; Blanch & Gabbett, 2016).
 * Acute Decay: lambda_a = 2 / (7 + 1) = 0.25 (7 days)
 * Chronic Decay: lambda_c = 2 / (28 + 1) = 0.0689655 (28 days)
 */
export function calculateEWMA_ACWR(dailyLoads: number[]): {
  ewmaAcute: number
  ewmaChronic: number
  uncoupledAcwr: number
  riskZone: 'undertrained' | 'optimal' | 'elevated_risk' | 'danger_zone'
  weekOverWeekChangePercent: number
  weeklySpikeAlert: boolean
} {
  if (!dailyLoads || dailyLoads.length === 0) {
    return {
      ewmaAcute: 0,
      ewmaChronic: 0,
      uncoupledAcwr: 0,
      riskZone: 'undertrained',
      weekOverWeekChangePercent: 0,
      weeklySpikeAlert: false,
    }
  }

  const lambdaAcute = 2 / (7 + 1) // 0.25
  const lambdaChronic = 2 / (28 + 1) // ~0.0689655

  let acuteEWMA = dailyLoads[0]
  let chronicEWMA = dailyLoads[0]

  for (let i = 1; i < dailyLoads.length; i++) {
    const load = dailyLoads[i]
    acuteEWMA = load * lambdaAcute + acuteEWMA * (1 - lambdaAcute)
    chronicEWMA = load * lambdaChronic + chronicEWMA * (1 - lambdaChronic)
  }

  const uncoupledAcwr = chronicEWMA > 0 ? Math.round((acuteEWMA / chronicEWMA) * 100) / 100 : 0

  let riskZone: 'undertrained' | 'optimal' | 'elevated_risk' | 'danger_zone' = 'optimal'
  if (uncoupledAcwr < 0.8) riskZone = 'undertrained'
  else if (uncoupledAcwr <= 1.3) riskZone = 'optimal'
  else if (uncoupledAcwr <= 1.5) riskZone = 'elevated_risk'
  else riskZone = 'danger_zone'

  // Week-over-week spike analysis: compare last 7 days vs previous 7 days
  let weekOverWeekChangePercent = 0
  let weeklySpikeAlert = false

  if (dailyLoads.length >= 14) {
    const currentWeekSum = dailyLoads.slice(-7).reduce((a, b) => a + b, 0)
    const prevWeekSum = dailyLoads.slice(-14, -7).reduce((a, b) => a + b, 0)

    if (prevWeekSum > 0) {
      weekOverWeekChangePercent = Math.round(((currentWeekSum - prevWeekSum) / prevWeekSum) * 100)
      // Blanch & Gabbett (2016): >15% increase doubles injury risk
      if (weekOverWeekChangePercent >= 15) {
        weeklySpikeAlert = true
      }
    }
  }

  return {
    ewmaAcute: Math.round(acuteEWMA),
    ewmaChronic: Math.round(chronicEWMA),
    uncoupledAcwr,
    riskZone,
    weekOverWeekChangePercent,
    weeklySpikeAlert,
  }
}

/**
 * Multi-day coupled ACWR calculator from an array of 28 daily loads
 * Enhanced with uncoupled EWMA and week-over-week telemetry
 */
export function calculateFromDailyLoads(dailyLoads28Days: number[]): ACWRResult {
  if (!dailyLoads28Days || dailyLoads28Days.length < 7) {
    return calculateACWR(0, 0)
  }

  // Last 7 days = acute load
  const last7Days = dailyLoads28Days.slice(-7)
  const acuteSum = last7Days.reduce((acc, curr) => acc + curr, 0)

  // 28 days average weekly load = chronic load
  const total28Sum = dailyLoads28Days.reduce((acc, curr) => acc + curr, 0)
  const weeksCount = dailyLoads28Days.length / 7
  const chronicWeeklyAvg = Math.round(total28Sum / weeksCount)

  const baseResult = calculateACWR(acuteSum, chronicWeeklyAvg)
  const ewmaResult = calculateEWMA_ACWR(dailyLoads28Days)

  return {
    ...baseResult,
    ewmaAcute: ewmaResult.ewmaAcute,
    ewmaChronic: ewmaResult.ewmaChronic,
    uncoupledAcwr: ewmaResult.uncoupledAcwr,
    weekOverWeekChangePercent: ewmaResult.weekOverWeekChangePercent,
    weeklySpikeAlert: ewmaResult.weeklySpikeAlert,
  }
}
