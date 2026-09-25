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

const STORAGE_KEY = 'auraswim_profile_data_v2' // Incremented to v2 to clean any old cached fake values

export const DEFAULT_SCHEDULE: WeeklyScheduleDay[] = [
  { day: 'Mon', label: 'Monday', type: 'Morning Double + Evening', targetMeters: 7500, hasDryland: true, hasCameraAudit: true, completed: false },
  { day: 'Tue', label: 'Tuesday', type: 'Afternoon Threshold', targetMeters: 6000, hasDryland: false, hasCameraAudit: false, completed: false },
  { day: 'Wed', label: 'Wednesday', type: 'Recovery + Technical', targetMeters: 4500, hasDryland: true, hasCameraAudit: true, completed: false },
  { day: 'Thu', label: 'Thursday', type: 'Afternoon Threshold', targetMeters: 6200, hasDryland: false, hasCameraAudit: false, completed: false },
  { day: 'Fri', label: 'Friday', type: 'Sprint + Camera Audit', targetMeters: 5500, hasDryland: true, hasCameraAudit: true, completed: false },
  { day: 'Sat', label: 'Saturday', type: 'Time Trials / Meet', targetMeters: 4500, hasDryland: false, hasCameraAudit: true, completed: false },
  { day: 'Sun', label: 'Sunday', type: 'Rest & Active SMR', targetMeters: 0, hasDryland: false, hasCameraAudit: false, completed: false },
]

export const DEFAULT_STORE: SwimmerProfileStore = {
  swimmerName: 'Competitive Swimmer',
  weeklyTargetMeters: 30000,
  smrCompletedIds: [],
  smrStreakDays: 0,
  lastSmrDate: '',
  mobilityLogs: [],
  weeklySchedule: DEFAULT_SCHEDULE,
  workouts: [],
  shoulderLogs: [],
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

export function updateSwimmerProfile(params: { name?: string; weeklyTargetMeters?: number }): SwimmerProfileStore {
  const current = loadSwimmerData()
  const updated: SwimmerProfileStore = {
    ...current,
    swimmerName: params.name !== undefined ? params.name : current.swimmerName,
    weeklyTargetMeters: params.weeklyTargetMeters !== undefined ? params.weeklyTargetMeters : current.weeklyTargetMeters,
  }
  saveSwimmerData(updated)
  return updated
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
  const newStreak = isNewDay ? (current.smrStreakDays || 0) + 1 : current.smrStreakDays

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
Weekly Target: ${data.weeklyTargetMeters ? `${data.weeklyTargetMeters.toLocaleString()}m` : 'Not Set'}
Total Meterage Logged: ${totalMeters.toLocaleString()}m
SMR Completion Streak: ${data.smrStreakDays} Consecutive Days

LATEST SHOULDER STATUS:
- Pain Scale: ${latestShoulder ? `${latestShoulder.painScale1to10}/10 (${latestShoulder.affectedSide} side)` : 'No pain logged'}
- Mobility Score: ${latestShoulder ? `${latestShoulder.mobilityScore1to100}%` : 'N/A'}
- Active Trigger Points: ${latestShoulder?.triggerPointsNoted?.length ? latestShoulder.triggerPointsNoted.join(', ') : 'None reported'}

LATEST AI CAMERA SCREENING:
- Test: ${latestMobility ? latestMobility.type.toUpperCase() : 'None completed'}
- Score: ${latestMobility ? `${latestMobility.measuredValue}° (${latestMobility.status.toUpperCase()})` : 'N/A'}
- Kinematic Assessment: ${latestMobility ? (latestMobility.passed ? 'PASSED - Cleared for High-Intensity Sets' : 'NEEDS SMR RESTORATION') : 'No camera tests performed yet'}

TRAINING LOAD & INJURY RISK STATUS:
- Workouts Logged: ${data.workouts.length} sessions
- ACWR Target Corridor: 0.80 - 1.30 (Sweet Spot)
- Soft-Tissue Protection: Subscapularis & Pec Minor SMR
========================================`
}
