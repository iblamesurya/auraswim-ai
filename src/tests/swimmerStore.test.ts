import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadSwimmerData,
  addWorkout,
  addShoulderLog,
  recordSMRCompletion,
  exportCoachReportJSON,
} from '../lib/storage/swimmerStore'

describe('swimmerStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads default clean swimmer data with zero initial mock logs', () => {
    const data = loadSwimmerData()
    expect(data.swimmerName).toBe('Competitive Swimmer')
    expect(data.smrStreakDays).toBe(0)
    expect(data.workouts.length).toBe(0)
    expect(data.shoulderLogs.length).toBe(0)
  })

  it('adds a new workout and persists to localStorage', () => {
    const updated = addWorkout({
      date: '2026-09-25',
      meters: 6200,
      durationMin: 105,
      rpeScale1to10: 8,
      strokeRateSpm: 46,
      dpsMeters: 1.92,
      notes: 'Threshold pull set with buoy',
    })

    expect(updated.workouts[0].meters).toBe(6200)
    const reloaded = loadSwimmerData()
    expect(reloaded.workouts[0].meters).toBe(6200)
  })

  it('records shoulder soreness and updates logs', () => {
    const updated = addShoulderLog({
      date: '2026-09-25',
      painScale1to10: 4,
      affectedSide: 'right',
      triggerPointsNoted: ['Pec Minor'],
      mobilityScore1to100: 72,
      notes: 'Pinching on recovery',
    })

    expect(updated.shoulderLogs[0].painScale1to10).toBe(4)
    expect(updated.shoulderLogs[0].affectedSide).toBe('right')
  })

  it('records SMR protocol completion', () => {
    const updated = recordSMRCompletion('thoracic-spine')
    expect(updated.smrCompletedIds).toContain('thoracic-spine')
  })

  it('exports valid JSON for coach reports', () => {
    const jsonStr = exportCoachReportJSON()
    const parsed = JSON.parse(jsonStr)
    expect(parsed.swimmerName).toBe('Competitive Swimmer')
    expect(Array.isArray(parsed.workouts)).toBe(true)
  })

  it('records camera mobility tests and persists history', async () => {
    const { addMobilityLog } = await import('../lib/storage/swimmerStore')
    const updated = addMobilityLog({
      date: '2026-09-25',
      type: 'streamline',
      measuredValue: 176,
      status: 'optimal',
      passed: true,
      notes: 'Thoracic reach fully cleared',
    })

    expect(updated.mobilityLogs[0].measuredValue).toBe(176)
    expect(updated.mobilityLogs[0].passed).toBe(true)
  })

  it('toggles weekly schedule day completion status', async () => {
    const { toggleScheduleDay } = await import('../lib/storage/swimmerStore')
    const updated = toggleScheduleDay('Wed')
    const wedDay = updated.weeklySchedule.find((d) => d.day === 'Wed')
    expect(wedDay?.completed).toBe(true)
  })

  it('generates a readable text summary report for coaches', async () => {
    const { generateCoachTextSummary } = await import('../lib/storage/swimmerStore')
    const summary = generateCoachTextSummary()
    expect(summary).toContain('AURASWIM AI • ATHLETE COACH REPORT')
    expect(summary).toContain('Swimmer Name:')
    expect(summary).toContain('SMR Completion Streak:')
  })
})
