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

const STORAGE_KEY = 'auraswim_profile_data_v2'
const CLOUDFLARE_API = 'https://auraswim-api.suryafyi.workers.dev'

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

// Background asynchronous synchronization with Cloudflare D1
async function syncWorkoutToCloud(workout: WorkoutLog) {
  try {
    await fetch(`${CLOUDFLARE_API}/api/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workout),
    })
  } catch (err) {
    console.debug('Cloud D1 sync deferred (offline mode):', err)
  }
}

async function syncShoulderToCloud(log: ShoulderSorenessLog) {
  try {
    await fetch(`${CLOUDFLARE_API}/api/shoulder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    })
  } catch (err) {
    console.debug('Cloud D1 sync deferred (offline mode):', err)
  }
}

async function syncProfileToCloud(profile: Partial<SwimmerProfileStore>) {
  try {
    await fetch(`${CLOUDFLARE_API}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
  } catch (err) {
    console.debug('Cloud D1 sync deferred (offline mode):', err)
  }
}

export async function pullCloudSwimmerData(): Promise<SwimmerProfileStore | null> {
  try {
    const [workoutsRes, shoulderRes] = await Promise.all([
      fetch(`${CLOUDFLARE_API}/api/workouts`),
      fetch(`${CLOUDFLARE_API}/api/shoulder`),
    ])

    if (workoutsRes.ok && shoulderRes.ok) {
      const wData: any = await workoutsRes.json()
      const sData: any = await shoulderRes.json()
      const current = loadSwimmerData()

      const existingWorkoutIds = new Set(current.workouts.map((w) => w.id))
      const newWorkouts = (wData.workouts || []).filter((w: any) => !existingWorkoutIds.has(w.id))

      const existingShoulderIds = new Set(current.shoulderLogs.map((s) => s.id))
      const newShoulder = (sData.shoulderLogs || []).filter((s: any) => !existingShoulderIds.has(s.id))

      if (newWorkouts.length > 0 || newShoulder.length > 0) {
        const merged: SwimmerProfileStore = {
          ...current,
          workouts: [...newWorkouts, ...current.workouts],
          shoulderLogs: [...newShoulder, ...current.shoulderLogs],
        }
        saveSwimmerData(merged)
        return merged
      }
    }
  } catch (err) {
    console.debug('Cloud D1 pull deferred (offline mode):', err)
  }
  return null
}

export function updateSwimmerProfile(params: { name?: string; weeklyTargetMeters?: number }): SwimmerProfileStore {
  const current = loadSwimmerData()
  const updated: SwimmerProfileStore = {
    ...current,
    swimmerName: params.name !== undefined ? params.name : current.swimmerName,
    weeklyTargetMeters: params.weeklyTargetMeters !== undefined ? params.weeklyTargetMeters : current.weeklyTargetMeters,
  }
  saveSwimmerData(updated)
  syncProfileToCloud(updated)
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
  syncWorkoutToCloud(newWorkout)
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
  syncShoulderToCloud(newLog)
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
  syncProfileToCloud(updated)
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
    mobilityLogs: [newLog, ...current.mobilityLogs],
  }
  saveSwimmerData(updated)
  return updated
}

export function toggleScheduleDay(day: string): SwimmerProfileStore {
  const current = loadSwimmerData()
  const updatedSchedule = current.weeklySchedule.map((d) => {
    if (d.day === day) {
      return { ...d, completed: !d.completed }
    }
    return d
  })
  const updated = {
    ...current,
    weeklySchedule: updatedSchedule,
  }
  saveSwimmerData(updated)
  return updated
}

export function exportCoachReportJSON(): string {
  const data = loadSwimmerData()
  return JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      swimmerName: data.swimmerName,
      athlete: data.swimmerName,
      targetMeters: data.weeklyTargetMeters,
      smrStreakDays: data.smrStreakDays,
      totalWorkouts: data.workouts.length,
      workouts: data.workouts,
      shoulderHealthHistory: data.shoulderLogs,
      mobilityTests: data.mobilityLogs,
    },
    null,
    2
  )
}

export function generateCoachTextSummary(): string {
  const data = loadSwimmerData()
  const totalMeters = data.workouts.reduce((acc, w) => acc + w.meters, 0)
  const avgRpe =
    data.workouts.length > 0
      ? (data.workouts.reduce((acc, w) => acc + w.rpeScale1to10, 0) / data.workouts.length).toFixed(1)
      : 'N/A'

  const latestShoulder = data.shoulderLogs[0]
  const shoulderStatus = latestShoulder
    ? `Pain ${latestShoulder.painScale1to10}/10 (${latestShoulder.affectedSide} shoulder). Mobility: ${latestShoulder.mobilityScore1to100}%. Notes: ${latestShoulder.notes || 'None'}`
    : 'No active shoulder pain reported.'

  return `AURASWIM AI • ATHLETE COACH REPORT
Swimmer Name: ${data.swimmerName}
Report Date: ${new Date().toLocaleDateString()}
Weekly Target: ${data.weeklyTargetMeters.toLocaleString()}m
Total Logged Meters: ${totalMeters.toLocaleString()}m
Logged Sessions: ${data.workouts.length}
Average Session RPE: ${avgRpe} / 10
SMR Completion Streak: ${data.smrStreakDays} Consecutive Days
Latest Shoulder Health Check:
${shoulderStatus}

Schedule Completion:
${data.weeklySchedule.map((d) => `- ${d.day} (${d.type}): ${d.completed ? 'COMPLETED' : 'PENDING'}`).join('\n')}
`
}
