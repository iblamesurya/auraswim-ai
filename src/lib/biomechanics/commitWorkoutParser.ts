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
  equipment?: string
  mechanicalStrainAU?: number
}

export interface WorkoutAnalysis {
  totalDistance: number
  itemCount: number
  estimatedDurationMinutes: number
  items: ParsedSetItem[]
  zoneMeters: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number>
  zonePercentages: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number>
  primaryFocusZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3'
  // Olympic enhancements
  totalMechanicalStrainAU: number
  hasHighTorquePaddles: boolean
  gearTagsDetected: string[]
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

/**
 * Pre-processes nested repetition bracket blocks: e.g. 3x [ 4x100 @ 1:15 + 2x50 @ :45 ]
 */
function expandNestedSets(text: string): string[] {
  const resultLines: string[] = []
  const lines = text.split('\n')

  let insideBracket = false
  let bracketMultiplier = 1
  let bracketLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect start of bracket block: e.g. 3x [ or 3* [ or 2x {
    const blockStartMatch = trimmed.match(/^(\d+)\s*[*xX]\s*[[{](.*)$/)
    if (blockStartMatch) {
      insideBracket = true
      bracketMultiplier = parseInt(blockStartMatch[1], 10)
      bracketLines = []
      const rest = blockStartMatch[2].replace(/[\]}]$/, '').trim()
      if (rest) bracketLines.push(rest)
      if (trimmed.includes(']') || trimmed.includes('}')) {
        // Single line closed block
        insideBracket = false
        for (let m = 0; m < bracketMultiplier; m++) {
          bracketLines.forEach((bl) => resultLines.push(bl))
        }
      }
      continue
    }

    if (insideBracket) {
      if (trimmed.includes(']') || trimmed.includes('}')) {
        const clean = trimmed.replace(/[\]}]/, '').trim()
        if (clean) bracketLines.push(clean)
        insideBracket = false
        for (let m = 0; m < bracketMultiplier; m++) {
          bracketLines.forEach((bl) => resultLines.push(bl))
        }
      } else {
        bracketLines.push(trimmed)
      }
      continue
    }

    resultLines.push(trimmed)
  }

  return resultLines
}

export function parseCommitWorkout(
  workoutText: string,
  swimmerCssSecPer100: number = 72
): WorkoutAnalysis {
  const expandedLines = expandNestedSets(workoutText)
  const items: ParsedSetItem[] = []

  let totalDistance = 0
  let totalSeconds = 0
  let totalMechanicalStrainAU = 0
  let hasHighTorquePaddles = false
  const gearTagsSet = new Set<string>()

  const zoneMeters: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number> = {
    EN1: 0,
    EN2: 0,
    EN3: 0,
    SP1: 0,
    SP2: 0,
    SP3: 0,
  }

  expandedLines.forEach((rawLine, idx) => {
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

    // 3. Extract Stroke
    let stroke = 'Freestyle'
    let strokeFactor = 1.0
    if (trimmed.match(/\b(fly|butterfly)\b/i)) {
      stroke = 'Butterfly'
      strokeFactor = 1.6
    } else if (trimmed.match(/\b(back|backstroke)\b/i)) {
      stroke = 'Backstroke'
      strokeFactor = 1.1
    } else if (trimmed.match(/\b(breast|breaststroke)\b/i)) {
      stroke = 'Breaststroke'
      strokeFactor = 1.2
    } else if (trimmed.match(/\b(im|medley)\b/i)) {
      stroke = 'Individual Medley'
      strokeFactor = 1.3
    } else if (trimmed.match(/\b(kick)\b/i)) {
      stroke = 'Kick'
      strokeFactor = 0.5
    } else if (trimmed.match(/\b(drill)\b/i)) {
      stroke = 'Technique Drill'
      strokeFactor = 0.8
    } else if (trimmed.match(/\b(pull)\b/i)) {
      stroke = 'Pull with Buoy'
      strokeFactor = 1.15
    }

    // 4. Equipment Detection & Torque Factor
    let equipment = 'None'
    let gearFactor = 1.0
    if (trimmed.match(/\b(paddle|paddles|pads)\b/i)) {
      equipment = 'Paddles'
      gearFactor = 1.35
      hasHighTorquePaddles = true
      gearTagsSet.add('Paddles')
    } else if (trimmed.match(/\b(fin|fins)\b/i)) {
      equipment = 'Fins'
      gearFactor = 0.85
      gearTagsSet.add('Fins')
    } else if (trimmed.match(/\b(chute|drag)\b/i)) {
      equipment = 'Drag Chute'
      gearFactor = 1.4
      gearTagsSet.add('Drag Chute')
    } else if (trimmed.match(/\b(snorkel)\b/i)) {
      equipment = 'Snorkel'
      gearFactor = 0.95
      gearTagsSet.add('Snorkel')
    }

    // 5. Extract Interval
    let intervalStr: string | undefined = undefined
    let intervalSecondsPerRep = 0
    const intervalMatch = trimmed.match(/(?:on|@|interval)\s*:?(\d+:?\d+)/i)
    if (intervalMatch) {
      intervalStr = intervalMatch[1]
      const parts = intervalStr.split(':')
      if (parts.length === 2) {
        intervalSecondsPerRep = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)
      } else {
        intervalSecondsPerRep = parseInt(parts[0], 10)
      }
      totalSeconds += intervalSecondsPerRep * reps
    } else {
      intervalSecondsPerRep = Math.round((distancePerRep / 100) * 85)
      totalSeconds += intervalSecondsPerRep * reps
    }

    // 6. Extract / Compute Energy Zone (Using explicit tags or CSS comparison)
    let energyZone: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3' = 'EN2'
    const zoneMatch = trimmed.match(/\b(EN1|EN2|EN3|SP1|SP2|SP3)\b/i)
    if (zoneMatch) {
      energyZone = zoneMatch[1].toUpperCase() as typeof energyZone
    } else if (trimmed.toLowerCase().includes('warm') || trimmed.toLowerCase().includes('cool') || trimmed.toLowerCase().includes('easy') || trimmed.toLowerCase().includes('recovery')) {
      energyZone = 'EN1'
    } else if (trimmed.toLowerCase().includes('sprint') || trimmed.toLowerCase().includes('fast') || trimmed.toLowerCase().includes('burst') || trimmed.toLowerCase().includes('alactic')) {
      energyZone = 'SP1'
    } else if (trimmed.toLowerCase().includes('threshold') || trimmed.toLowerCase().includes('pace')) {
      energyZone = 'EN2'
    } else if (intervalSecondsPerRep > 0 && distancePerRep > 0 && swimmerCssSecPer100 > 0) {
      // Dynamic CSS Pace Evaluation
      const pacePer100 = (intervalSecondsPerRep / distancePerRep) * 100
      if (pacePer100 <= swimmerCssSecPer100 - 3) energyZone = 'SP1'
      else if (pacePer100 <= swimmerCssSecPer100 + 2) energyZone = 'EN3'
      else if (pacePer100 <= swimmerCssSecPer100 + 7) energyZone = 'EN2'
      else energyZone = 'EN1'
    }

    zoneMeters[energyZone] += setTotal

    // Mechanical Strain in Arbitrary Units (Foster TRIMP + Biomechanical Torque)
    const rpeMap: Record<'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3', number> = {
      SP3: 10.0,
      SP2: 9.5,
      SP1: 8.5,
      EN3: 7.5,
      EN2: 6.5,
      EN1: 4.0,
    }
    const rpeEstimate = rpeMap[energyZone as 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3'] ?? 6.0
    const setStrain = Math.round((setTotal / 100) * rpeEstimate * strokeFactor * gearFactor)
    totalMechanicalStrainAU += setStrain

    items.push({
      id: `set-${idx}`,
      raw: trimmed,
      reps,
      distancePerRep,
      totalDistance: setTotal,
      stroke,
      interval: intervalStr,
      energyZone,
      equipment: equipment !== 'None' ? equipment : undefined,
      mechanicalStrainAU: setStrain,
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
    totalMechanicalStrainAU,
    hasHighTorquePaddles,
    gearTagsDetected: Array.from(gearTagsSet),
  }
}
