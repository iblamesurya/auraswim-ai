export interface WorkoutLog {
  id: string
  date: string // YYYY-MM-DD
  meters: number
  durationMin: number
  rpeScale1to10: number
  strokeRateSpm?: number
  dpsMeters?: number
  notes?: string
}

export interface ShoulderSorenessLog {
  id: string
  date: string
  painScale1to10: number
  affectedSide: 'none' | 'left' | 'right' | 'both'
  triggerPointsNoted: string[]
  mobilityScore1to100: number
  notes?: string
}

export interface SwimmerProfileStore {
  swimmerName: string
  weeklyTargetMeters: number
  smrCompletedIds: string[]
  smrStreakDays: number
  lastSmrDate: string
  workouts: WorkoutLog[]
  shoulderLogs: ShoulderSorenessLog[]
}

const STORAGE_KEY = 'auraswim_profile_data_v1'

const DEFAULT_STORE: SwimmerProfileStore = {
  swimmerName: 'Competitive Swimmer',
  weeklyTargetMeters: 36000,
  smrCompletedIds: ['pec-minor', 'subscapularis'],
  smrStreakDays: 14,
  lastSmrDate: new Date().toISOString().split('T')[0],
  workouts: [
    {
      id: 'w-1',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      meters: 5400,
      durationMin: 90,
      rpeScale1to10: 7,
      strokeRateSpm: 44,
      dpsMeters: 1.95,
      notes: 'Threshold aerobic freestyle set.',
    },
    {
      id: 'w-2',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      meters: 6000,
      durationMin: 100,
      rpeScale1to10: 8,
      strokeRateSpm: 46,
      dpsMeters: 1.88,
      notes: 'Pacing 200m broken swims.',
    },
    {
      id: 'w-3',
      date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      meters: 4800,
      durationMin: 80,
      rpeScale1to10: 6,
      strokeRateSpm: 42,
      dpsMeters: 2.05,
      notes: 'Recovery kick and stroke drill focus.',
    },
  ],
  shoulderLogs: [
    {
      id: 's-1',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      painScale1to10: 3,
      affectedSide: 'right',
      triggerPointsNoted: ['Pec Minor', 'Subscapularis'],
      mobilityScore1to100: 75,
      notes: 'Mild anterior tightness after fly sprint.',
    },
    {
      id: 's-2',
      date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      painScale1to10: 1,
      affectedSide: 'none',
      triggerPointsNoted: [],
      mobilityScore1to100: 92,
      notes: 'Pec minor SMR released tightness, shoulders felt loose in morning double.',
    },
  ],
}

export function loadSwimmerData(): SwimmerProfileStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STORE
    return { ...DEFAULT_STORE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STORE
  }
}

export function saveSwimmerData(data: SwimmerProfileStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save swimmer profile data to localStorage', err)
  }
}

export function addWorkout(workout: Omit<WorkoutLog, 'id'>): SwimmerProfileStore {
  const current = loadSwimmerData()
  const newWorkout: WorkoutLog = {
    ...workout,
    id: `w-${Date.now()}`,
  }
  const updated = {
    ...current,
    workouts: [newWorkout, ...current.workouts],
  }
  saveSwimmerData(updated)
  return updated
}

export function addShoulderLog(log: Omit<ShoulderSorenessLog, 'id'>): SwimmerProfileStore {
  const current = loadSwimmerData()
  const newLog: ShoulderSorenessLog = {
    ...log,
    id: `s-${Date.now()}`,
  }
  const updated = {
    ...current,
    shoulderLogs: [newLog, ...current.shoulderLogs],
  }
  saveSwimmerData(updated)
  return updated
}

export function recordSMRCompletion(protocolId: string): SwimmerProfileStore {
  const current = loadSwimmerData()
  const today = new Date().toISOString().split('T')[0]

  const alreadyCompleted = current.smrCompletedIds.includes(protocolId)
  const isNewDay = current.lastSmrDate !== today

  const newIds = alreadyCompleted ? current.smrCompletedIds : [...current.smrCompletedIds, protocolId]
  const newStreak = isNewDay ? current.smrStreakDays + 1 : current.smrStreakDays

  const updated: SwimmerProfileStore = {
    ...current,
    smrCompletedIds: newIds,
    smrStreakDays: newStreak,
    lastSmrDate: today,
  }
  saveSwimmerData(updated)
  return updated
}

export function exportCoachReportJSON(): string {
  const data = loadSwimmerData()
  return JSON.stringify(data, null, 2)
}
