export interface ACWRResult {
  acuteLoad: number
  chronicLoad: number
  acwr: number
  riskZone: 'undertrained' | 'optimal' | 'elevated_risk' | 'danger_zone'
  riskLabel: string
  color: string
  injuryProbability: string
  coachingRecommendation: string
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
 * Multi-day coupled ACWR calculator from an array of 28 daily loads
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

  return calculateACWR(acuteSum, chronicWeeklyAvg)
}
