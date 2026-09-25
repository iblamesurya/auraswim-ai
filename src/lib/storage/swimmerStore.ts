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

export interface MobilityTestLog {
  id: string
  date: string
  type: 'streamline' | 'evf' | 'asymmetry'
  measuredValue: number // degrees or asymmetry %
  status: 'optimal' | 'moderate' | 'restricted'
  passed: boolean
  notes?: string
}

export interface WeeklyScheduleDay {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  label: string
  type: 'Morning Double + Evening' | 'Afternoon Threshold' | 'Recovery + Technical' | 'Sprint + Camera Audit' | 'Time Trials / Meet' | 'Rest & Active SMR'
  targetMeters: number
  hasDryland: boolean
  hasCameraAudit: boolean
  completed: boolean
}

export interface SwimmerProfileStore {
  swimmerName: string
  weeklyTargetMeters: number
  smrCompletedIds: string[]
  smrStreakDays: number
  lastSmrDate: string
  workouts: WorkoutLog[]
  shoulderLogs: ShoulderSorenessLog[]
  mobilityLogs: MobilityTestLog[]
  weeklySchedule: WeeklyScheduleDay[]
}

const STORAGE_KEY = 'auraswim_profile_data_v1'

const DEFAULT_SCHEDULE: WeeklyScheduleDay[] = [
  { day: 'Mon', label: 'Monday', type: 'Morning Double + Evening', targetMeters: 7500, hasDryland: true, hasCameraAudit: true, completed: true },
  { day: 'Tue', label: 'Tuesday', type: 'Afternoon Threshold', targetMeters: 6000, hasDryland: false, hasCameraAudit: false, completed: true },
  { day: 'Wed', label: 'Wednesday', type: 'Recovery + Technical', targetMeters: 4500, hasDryland: true, hasCameraAudit: true, completed: false },
  { day: 'Thu', label: 'Thursday', type: 'Afternoon Threshold', targetMeters: 6200, hasDryland: false, hasCameraAudit: false, completed: false },
  { day: 'Fri', label: 'Friday', type: 'Sprint + Camera Audit', targetMeters: 5500, hasDryland: true, hasCameraAudit: true, completed: false },
  { day: 'Sat', label: 'Saturday', type: 'Time Trials / Meet', targetMeters: 4500, hasDryland: false, hasCameraAudit: true, completed: false },
  { day: 'Sun', label: 'Sunday', type: 'Rest & Active SMR', targetMeters: 0, hasDryland: false, hasCameraAudit: false, completed: false },
]

const DEFAULT_STORE: SwimmerProfileStore = {
  swimmerName: 'Competitive Swimmer',
  weeklyTargetMeters: 34200,
  smrCompletedIds: ['pec-minor', 'subscapularis'],
  smrStreakDays: 14,
  lastSmrDate: new Date().toISOString().split('T')[0],
  mobilityLogs: [
    {
      id: 'm-1',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      type: 'streamline',
      measuredValue: 174,
      status: 'optimal',
      passed: true,
      notes: 'Thoracic extension clear, no lumbar arching.',
    },
    {
      id: 'm-2',
      date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
      type: 'evf',
      measuredValue: 118,
      status: 'optimal',
      passed: true,
      notes: 'High elbow catch locked on right arm.',
    },
  ],
  weeklySchedule: DEFAULT_SCHEDULE,
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

export function addMobilityLog(log: Omit<MobilityTestLog, 'id'>): SwimmerProfileStore {
  const current = loadSwimmerData()
  const newLog: MobilityTestLog = {
    ...log,
    id: `m-${Date.now()}`,
  }
  const updated = {
    ...current,
    mobilityLogs: [newLog, ...(current.mobilityLogs || [])],
  }
  saveSwimmerData(updated)
  return updated
}

export function toggleScheduleDay(dayName: string): SwimmerProfileStore {
  const current = loadSwimmerData()
  const schedule = (current.weeklySchedule || DEFAULT_SCHEDULE).map((item) =>
    item.day === dayName ? { ...item, completed: !item.completed } : item
  )
  const updated = {
    ...current,
    weeklySchedule: schedule,
  }
  saveSwimmerData(updated)
  return updated
}

export function exportCoachReportJSON(): string {
  const data = loadSwimmerData()
  return JSON.stringify(data, null, 2)
}

export function generateCoachTextSummary(): string {
  const data = loadSwimmerData()
  const totalMeters = data.workouts.reduce((acc, w) => acc + w.meters, 0)
  const latestShoulder = data.shoulderLogs[0]
  const latestMobility = data.mobilityLogs[0]

  return `========================================
AURASWIM AI • ATHLETE COACH REPORT
========================================
Swimmer Name: ${data.swimmerName}
Report Generated: ${new Date().toLocaleDateString()}
Weekly Target: ${data.weeklyTargetMeters.toLocaleString()}m
Recent Total Logged: ${totalMeters.toLocaleString()}m
SMR Completion Streak: ${data.smrStreakDays} Consecutive Days

LATEST SHOULDER STATUS:
- Pain Scale: ${latestShoulder ? `${latestShoulder.painScale1to10}/10 (${latestShoulder.affectedSide} side)` : 'No recent pain logged'}
- Mobility Score: ${latestShoulder ? `${latestShoulder.mobilityScore1to100}%` : 'N/A'}
- Active Trigger Points: ${latestShoulder?.triggerPointsNoted.join(', ') || 'None reported'}

LATEST AI CAMERA SCREENING:
- Test: ${latestMobility?.type.toUpperCase() || 'Streamline'}
- Score: ${latestMobility?.measuredValue || 174}° (${latestMobility?.status.toUpperCase() || 'OPTIMAL'})
- Kinematic Assessment: ${latestMobility?.passed ? 'PASSED - Cleared for High-Intensity Sets' : 'NEEDS SMR RESTORATION'}

TRAINING LOAD & INJURY RISK STATUS:
- ACWR Target: 0.80 - 1.30 (Sweet Spot)
- Soft-Tissue Protection: Subscapularis & Pec Minor SMR active
========================================`
}
