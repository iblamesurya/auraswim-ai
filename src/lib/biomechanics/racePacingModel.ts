/**
 * TritonWear & Omega ARES Race Pacing & Split Model
 * Models Olympic / NCAA segment splits: Reaction Time, 15m Breakout, Clean Swim Velocity,
 * Turn In/Contact/Out times, and Finish touch.
 */

export interface RaceSplitLap {
  lapNumber: number
  distanceMeters: number
  splitSeconds: number
  cumulativeSeconds: number
  strokeRateSpm: number
  dpsMeters: number
  cleanSpeedMps: number
  turnContactSeconds?: number
  turnOut15mSeconds?: number
  breakout15mTimeSeconds?: number
  cleanSwim35mTimeSeconds?: number
}

export interface RacePacingPlan {
  eventName: string
  course: 'LCM' | 'SCY' | 'SCM'
  targetTimeSeconds: number
  formattedTargetTime: string
  reactionTimeSeconds: number
  strategy: 'negative_split' | 'even_pace' | 'aggressive_front'
  laps: RaceSplitLap[]
  firstHalfSeconds: number
  secondHalfSeconds: number
  pacingDifferentialSeconds: number
  averageStrokeRate: number
  averageDps: number
  strokeIndex: number // Velocity * DPS
  coachPacingAdvice: string
}

export function formatSwimTime(totalSeconds: number): string {
  if (totalSeconds < 60) {
    return totalSeconds.toFixed(2) + 's'
  }
  const min = Math.floor(totalSeconds / 60)
  const sec = (totalSeconds % 60).toFixed(2)
  return `${min}:${parseFloat(sec) < 10 ? '0' : ''}${sec}`
}

export function generateOlympicRacePacing(params: {
  distance: 50 | 100 | 200 | 400
  stroke: 'Freestyle' | 'Butterfly' | 'Backstroke' | 'Breaststroke' | 'IM'
  targetTimeSeconds: number
  strategy: 'negative_split' | 'even_pace' | 'aggressive_front'
  course?: 'LCM' | 'SCY' | 'SCM'
}): RacePacingPlan {
  const { distance, stroke, targetTimeSeconds, strategy, course = 'SCY' } = params
  const lapDistance = course === 'LCM' ? 50 : 25
  const totalLaps = Math.max(1, distance / lapDistance)

  const reactionTime = 0.64 // Standard competitive reaction time

  // Calculate lap distribution based on distance and strategy
  const laps: RaceSplitLap[] = []
  let cumulative = 0

  if (distance === 100) {
    // 100m/100y: Lap 1 has dive start (-1.5s faster than clean lap)
    // Standard elite differential: Lap 2 is ~1.8s - 2.5s slower than Lap 1
    const diveBonus = 1.6
    let lap1Time = 0
    let lap2Time = 0

    if (strategy === 'aggressive_front') {
      lap1Time = (targetTimeSeconds - 2.6 + diveBonus) / 2 - diveBonus
      lap2Time = targetTimeSeconds - lap1Time
    } else if (strategy === 'negative_split') {
      lap1Time = (targetTimeSeconds - 0.4 + diveBonus) / 2 - diveBonus
      lap2Time = targetTimeSeconds - lap1Time
    } else {
      // Even pace
      lap1Time = (targetTimeSeconds - 1.5 + diveBonus) / 2 - diveBonus
      lap2Time = targetTimeSeconds - lap1Time
    }

    if (lapDistance === 50) {
      // 2 laps (LCM)
      laps.push({
        lapNumber: 1,
        distanceMeters: 50,
        splitSeconds: parseFloat(lap1Time.toFixed(2)),
        cumulativeSeconds: parseFloat(lap1Time.toFixed(2)),
        strokeRateSpm: stroke === 'Freestyle' ? 48 : 44,
        dpsMeters: 2.05,
        cleanSpeedMps: parseFloat((50 / lap1Time).toFixed(2)),
        breakout15mTimeSeconds: parseFloat((lap1Time * 0.28).toFixed(2)),
        cleanSwim35mTimeSeconds: parseFloat((lap1Time * 0.72).toFixed(2)),
      })
      laps.push({
        lapNumber: 2,
        distanceMeters: 100,
        splitSeconds: parseFloat(lap2Time.toFixed(2)),
        cumulativeSeconds: parseFloat((lap1Time + lap2Time).toFixed(2)),
        strokeRateSpm: stroke === 'Freestyle' ? 46 : 42,
        dpsMeters: 1.92,
        cleanSpeedMps: parseFloat((50 / lap2Time).toFixed(2)),
        turnContactSeconds: 0.28,
        breakout15mTimeSeconds: parseFloat((lap2Time * 0.32).toFixed(2)),
        cleanSwim35mTimeSeconds: parseFloat((lap2Time * 0.68).toFixed(2)),
      })
    } else {
      // 4 laps (SCY)
      const qTime1 = lap1Time * 0.46 // Dive 25
      const qTime2 = lap1Time * 0.54
      const qTime3 = lap2Time * 0.49
      const qTime4 = lap2Time * 0.51

      const splits = [qTime1, qTime2, qTime3, qTime4]
      splits.forEach((s, i) => {
        cumulative += s
        laps.push({
          lapNumber: i + 1,
          distanceMeters: (i + 1) * 25,
          splitSeconds: parseFloat(s.toFixed(2)),
          cumulativeSeconds: parseFloat(cumulative.toFixed(2)),
          strokeRateSpm: 46 - i * 0.5,
          dpsMeters: 2.0 - i * 0.05,
          cleanSpeedMps: parseFloat((25 / s).toFixed(2)),
          turnContactSeconds: i > 0 ? 0.27 : undefined,
        })
      })
    }
  } else if (distance === 200) {
    // 200m/200y: 4 x 50s
    // Standard target: Lap 1 is fast with dive; Laps 2, 3 hold threshold; Lap 4 finish kick
    const cleanLapTime = (targetTimeSeconds + 1.8) / 4
    const lap1 = cleanLapTime - 1.8
    const lap2 = cleanLapTime + 0.5
    const lap3 = strategy === 'negative_split' ? cleanLapTime + 0.2 : cleanLapTime + 0.7
    const lap4 = targetTimeSeconds - (lap1 + lap2 + lap3)

    const fiftySplits = [lap1, lap2, lap3, lap4]
    fiftySplits.forEach((s, idx) => {
      cumulative += s
      laps.push({
        lapNumber: idx + 1,
        distanceMeters: (idx + 1) * 50,
        splitSeconds: parseFloat(s.toFixed(2)),
        cumulativeSeconds: parseFloat(cumulative.toFixed(2)),
        strokeRateSpm: 42 - idx * 0.5,
        dpsMeters: 1.95,
        cleanSpeedMps: parseFloat((50 / s).toFixed(2)),
        turnContactSeconds: idx > 0 ? 0.29 : undefined,
        breakout15mTimeSeconds: parseFloat((s * (idx === 0 ? 0.28 : 0.32)).toFixed(2)),
        cleanSwim35mTimeSeconds: parseFloat((s * (idx === 0 ? 0.72 : 0.68)).toFixed(2)),
      })
    })
  } else {
    // 50m or 400m
    const baseLap = targetTimeSeconds / totalLaps
    for (let i = 1; i <= totalLaps; i++) {
      const s = i === 1 ? baseLap - 1.2 : baseLap + 1.2 / (totalLaps - 1)
      cumulative += s
      laps.push({
        lapNumber: i,
        distanceMeters: i * lapDistance,
        splitSeconds: parseFloat(s.toFixed(2)),
        cumulativeSeconds: parseFloat(cumulative.toFixed(2)),
        strokeRateSpm: 44,
        dpsMeters: 1.98,
        cleanSpeedMps: parseFloat((lapDistance / s).toFixed(2)),
        turnContactSeconds: i > 1 ? 0.28 : undefined,
      })
    }
  }

  const halfLapIndex = Math.floor(laps.length / 2)
  const firstHalf = laps.slice(0, halfLapIndex).reduce((a, b) => a + b.splitSeconds, 0)
  const secondHalf = laps.slice(halfLapIndex).reduce((a, b) => a + b.splitSeconds, 0)
  const diff = secondHalf - firstHalf

  const avgSR = Math.round(laps.reduce((a, b) => a + b.strokeRateSpm, 0) / laps.length)
  const avgDPS = parseFloat(
    (laps.reduce((a, b) => a + b.dpsMeters, 0) / laps.length).toFixed(2)
  )
  const avgVelocity = distance / targetTimeSeconds
  const strokeIndex = parseFloat((avgVelocity * avgDPS).toFixed(2))

  let coachAdvice = ''
  if (diff > 3.0 && distance >= 100) {
    coachAdvice = `Warning: The second half drop-off (+${diff.toFixed(2)}s) indicates high lactate accumulation. Target higher distance per stroke (DPS: ${avgDPS}m) on the first 50m to conserve glycogen.`
  } else if (diff <= 1.8 && distance >= 100) {
    coachAdvice = `Elite Pacing Corridor! Controlled differential (+${diff.toFixed(2)}s) mirrors Olympic finalist pacing (TritonWear Gold Standard). Hold turn contact under 0.30s.`
  } else {
    coachAdvice = `Solid tactical breakdown. Focus on 15m breakout kicking off all turns to sustain clean forward velocity.`
  }

  return {
    eventName: `${distance} ${stroke}`,
    course,
    targetTimeSeconds,
    formattedTargetTime: formatSwimTime(targetTimeSeconds),
    reactionTimeSeconds: reactionTime,
    strategy,
    laps,
    firstHalfSeconds: parseFloat(firstHalf.toFixed(2)),
    secondHalfSeconds: parseFloat(secondHalf.toFixed(2)),
    pacingDifferentialSeconds: parseFloat(diff.toFixed(2)),
    averageStrokeRate: avgSR,
    averageDps: avgDPS,
    strokeIndex,
    coachPacingAdvice: coachAdvice,
  }
}
