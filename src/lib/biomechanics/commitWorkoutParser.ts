/**
 * Commit Swimming Pro Workout Syntax Parser
 * Parses collegiate/Olympic swimming workout scripts and computes total yardage/meters,
 * energy zone distribution (EN1 to SP3), and interval duration.
 */

export interface ParsedSetItem {
  id: string
  raw: string
  reps: number
  distancePerRep: number
  totalDistance: number
  stroke: string
  interval?: string
  energyZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3'
  notes?: string
}

export interface WorkoutAnalysis {
  totalDistance: number
  itemCount: number
  estimatedDurationMinutes: number
  items: ParsedSetItem[]
  zoneMeters: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number>
  zonePercentages: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number>
  primaryFocusZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3'
}

export const ENERGY_ZONE_DEFINITIONS = {
  EN1: {
    name: 'Aerobic Recovery & Base',
    hrTarget: '60% - 70% HR Max',
    lactate: '< 2.0 mmol/L',
    color: '#06b6d4', // cyan
    purpose: 'Capillary density, mitochondrial biogenesis, active recovery.',
  },
  EN2: {
    name: 'Aerobic Threshold / Critical Speed',
    hrTarget: '72% - 82% HR Max',
    lactate: '2.0 - 4.0 mmol/L',
    color: '#3b82f6', // blue
    purpose: 'Maximal lactate steady state. Builds 200m/400m endurance engine.',
  },
  EN3: {
    name: 'VO2 Max / Aerobic Capacity',
    hrTarget: '85% - 92% HR Max',
    lactate: '4.0 - 6.0 mmol/L',
    color: '#8b5cf6', // purple
    purpose: 'Cardiac stroke volume overload and acute oxygen uptake.',
  },
  SP1: {
    name: 'Lactate Production',
    hrTarget: '90% - 95% HR Max',
    lactate: '6.0 - 9.0 mmol/L',
    color: '#f59e0b', // amber
    purpose: 'Glycolytic rate expansion for 100m/200m speed reserve.',
  },
  SP2: {
    name: 'Lactate Tolerance (Race Pace)',
    hrTarget: '95% - 100% HR Max',
    lactate: '> 9.0 mmol/L',
    color: '#ef4444', // red
    purpose: 'Buffering muscle acidosis under severe race fatigue.',
  },
  SP3: {
    name: 'Alactic Neuromuscular Sprint',
    hrTarget: 'Max Effort (<15s bursts)',
    lactate: 'Minimal (ATP-CP)',
    color: '#ec4899', // pink
    purpose: 'Fast-twitch motor unit recruitment and breakout velocity.',
  },
}

export function parseCommitWorkout(workoutText: string): WorkoutAnalysis {
  const lines = workoutText.split('\n')
  const items: ParsedSetItem[] = []

  let totalDistance = 0
  let totalSeconds = 0

  const zoneMeters: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number> = {
    EN1: 0,
    EN2: 0,
    EN3: 0,
    SP1: 0,
    SP2: 0,
    SP3: 0,
  }

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.endsWith(':')) return

    // 1. Check for reps x distance (e.g. 10 x 100 or 10x100 or 8*50)
    const repDistMatch = trimmed.match(/(\d+)\s*[*xX]\s*(\d{2,4})/)
    // 2. Check for single distance (e.g. 400 Swim or 800 pull)
    const singleDistMatch = trimmed.match(/^(\d{2,4})\b/)

    let reps = 1
    let distancePerRep = 0

    if (repDistMatch) {
      reps = parseInt(repDistMatch[1], 10)
      distancePerRep = parseInt(repDistMatch[2], 10)
    } else if (singleDistMatch) {
      reps = 1
      distancePerRep = parseInt(singleDistMatch[1], 10)
    } else {
      return // Not a swim set line
    }

    const setTotal = reps * distancePerRep
    totalDistance += setTotal

    // 3. Extract Energy Zone
    let energyZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3' = 'EN2' // Default aerobic threshold
    const zoneMatch = trimmed.match(/\b(EN1|EN2|EN3|SP1|SP2|SP3)\b/i)
    if (zoneMatch) {
      energyZone = zoneMatch[1].toUpperCase() as typeof energyZone
    } else if (trimmed.toLowerCase().includes('warm') || trimmed.toLowerCase().includes('cool') || trimmed.toLowerCase().includes('easy') || trimmed.toLowerCase().includes('recovery')) {
      energyZone = 'EN1'
    } else if (trimmed.toLowerCase().includes('sprint') || trimmed.toLowerCase().includes('fast') || trimmed.toLowerCase().includes('burst')) {
      energyZone = 'SP1'
    } else if (trimmed.toLowerCase().includes('threshold') || trimmed.toLowerCase().includes('pace')) {
      energyZone = 'EN2'
    }

    zoneMeters[energyZone] += setTotal

    // 4. Extract Stroke
    let stroke = 'Freestyle'
    if (trimmed.match(/\b(fly|butterfly)\b/i)) stroke = 'Butterfly'
    else if (trimmed.match(/\b(back|backstroke)\b/i)) stroke = 'Backstroke'
    else if (trimmed.match(/\b(breast|breaststroke)\b/i)) stroke = 'Breaststroke'
    else if (trimmed.match(/\b(im|medley)\b/i)) stroke = 'Individual Medley'
    else if (trimmed.match(/\b(kick)\b/i)) stroke = 'Kick'
    else if (trimmed.match(/\b(drill)\b/i)) stroke = 'Technique Drill'
    else if (trimmed.match(/\b(pull)\b/i)) stroke = 'Pull with Buoy'

    // 5. Extract Interval
    let intervalStr: string | undefined = undefined
    const intervalMatch = trimmed.match(/(?:on|@|interval)\s*:?(\d+:?\d+)/i)
    if (intervalMatch) {
      intervalStr = intervalMatch[1]
      const parts = intervalStr.split(':')
      let sec = 0
      if (parts.length === 2) {
        sec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
      } else {
        sec = parseInt(parts[0], 10)
      }
      totalSeconds += sec * reps
    } else {
      // Default estimate based on distance: ~1:25 per 100m
      totalSeconds += Math.round((distancePerRep / 100) * 85) * reps
    }

    items.push({
      id: `set-${idx}`,
      raw: trimmed,
      reps,
      distancePerRep,
      totalDistance: setTotal,
      stroke,
      interval: intervalStr,
      energyZone,
    })
  })

  // Calculate percentages
  const zonePercentages: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number> = {
    EN1: 0,
    EN2: 0,
    EN3: 0,
    SP1: 0,
    SP2: 0,
    SP3: 0,
  }

  let primaryFocusZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3' = 'EN2'
  let maxZoneDist = 0

  if (totalDistance > 0) {
    ;(Object.keys(zoneMeters) as Array<keyof typeof zoneMeters>).forEach((z) => {
      zonePercentages[z] = Math.round((zoneMeters[z] / totalDistance) * 100)
      if (zoneMeters[z] > maxZoneDist) {
        maxZoneDist = zoneMeters[z]
        primaryFocusZone = z
      }
    })
  }

  return {
    totalDistance,
    itemCount: items.length,
    estimatedDurationMinutes: Math.round(totalSeconds / 60) || Math.round(totalDistance / 50),
    items,
    zoneMeters,
    zonePercentages,
    primaryFocusZone,
  }
}
