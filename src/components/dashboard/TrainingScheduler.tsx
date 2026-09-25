import React, { useState } from 'react'
import {
  Clock,
  CheckCircle2,
  Sun,
  Droplets,
  Moon,
  ArrowRight,
  Calendar,
  FileText,
  Copy,
  Download,
  Check,
  X,
  Dumbbell,
  Camera,
} from 'lucide-react'
import {
  loadSwimmerData,
  toggleScheduleDay,
  generateCoachTextSummary,
} from '../../lib/storage/swimmerStore'

interface TrainingSchedulerProps {
  onNavigateTab: (tab: string) => void
}

export const TrainingScheduler: React.FC<TrainingSchedulerProps> = ({ onNavigateTab }) => {
  const [activePhase, setActivePhase] = useState<'pre' | 'pool' | 'post'>('pre')
  const [completedItems, setCompletedItems] = useState<string[]>([])
  const [swimmerData, setSwimmerData] = useState(loadSwimmerData())
  const [showCoachReportModal, setShowCoachReportModal] = useState(false)
  const [copiedReport, setCopiedReport] = useState(false)

  const handleToggleDay = (dayName: string) => {
    const updated = toggleScheduleDay(dayName)
    setSwimmerData(updated)
  }

  const handleCopyReport = () => {
    const text = generateCoachTextSummary()
    navigator.clipboard.writeText(text)
    setCopiedReport(true)
    setTimeout(() => setCopiedReport(false), 2000)
  }

  const handleDownloadReport = () => {
    const text = generateCoachTextSummary()
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `AuraSwim-Coach-Report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
  }

  const toggleItem = (id: string) => {
    setCompletedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const phases = [
    {
      id: 'pre',
      title: '1. Pre-Swim Activation',
      timing: 'Deck / Locker Room (5–8 Min)',
      icon: Sun,
      color: 'from-amber-500 to-orange-500',
      badge: 'Injury Shield Active',
      summary: 'Wake up restricted fascia and verify shoulder overhead streamline before diving in.',
      tasks: [
        {
          id: 't-pre-1',
          name: 'Pec Minor & Subscapularis SMR',
          detail: '60s per side with lacrosse ball / thumb palpation to stop forward shoulder rounding.',
          actionTab: 'smr',
          actionLabel: 'Launch SMR Timer',
        },
        {
          id: 't-pre-2',
          name: 'Camera Streamline & Flexion Check',
          detail: '30s check in front of phone camera. Verifies overhead reach is at 170°+ without back arching.',
          actionTab: 'camera',
          actionLabel: 'Run Streamline Test',
        },
        {
          id: 't-pre-3',
          name: 'Dynamic Arm Swings & Band Pull-Aparts',
          detail: '15 reps with mini-band to activate rotator cuff stabilizers.',
          actionTab: null,
          actionLabel: null,
        },
      ],
    },
    {
      id: 'pool',
      title: '2. In-Pool & Split Check',
      timing: 'Deckside / Post-Set (2–3 Min)',
      icon: Droplets,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Biomechanical Edge',
      summary: 'Check stroke efficiency, stroke rate vs distance-per-stroke (DPS), and upload video clips.',
      tasks: [
        {
          id: 't-pool-1',
          name: 'Stroke Rate & DPS SWOLF Check',
          detail: 'Log 50m/100m split time and stroke count to calculate forward velocity and efficiency score.',
          actionTab: 'analytics',
          actionLabel: 'Calculate SWOLF',
        },
        {
          id: 't-pool-2',
          name: 'Early Vertical Forearm (EVF) Catch Video Check',
          detail: 'Have coach or parent record a 5-sec clip to check if elbow is dropping below 125° during pull.',
          actionTab: 'camera',
          actionLabel: 'Check EVF Catch Angle',
        },
        {
          id: 't-pool-3',
          name: 'Check Pull Asymmetry & Breathing Balance',
          detail: 'Verify equal pull power between breathing side and non-breathing side.',
          actionTab: 'camera',
          actionLabel: 'Open Asymmetry Tool',
        },
      ],
    },
    {
      id: 'post',
      title: '3. Evening Soft-Tissue Recovery',
      timing: 'At Home Before Bed (10 Min)',
      icon: Moon,
      color: 'from-indigo-500 to-purple-600',
      badge: 'Recovery Potentiation',
      summary: 'Deep contract-relax myofascial release, log daily yardage into ACWR model, and protect tissues.',
      tasks: [
        {
          id: 't-post-1',
          name: 'Thoracic Foam Rolling & Plantar Ball Roll',
          detail: '90s thoracic extensions across roller + 60s per foot on lacrosse ball for ankle snap.',
          actionTab: 'smr',
          actionLabel: 'Open Evening SMR',
        },
        {
          id: 't-post-2',
          name: 'Log Practice Yardage (ACWR Injury Check)',
          detail: 'Record workout volume (e.g. 5,200m) and RPE to ensure training load stays in the Sweet Spot.',
          actionTab: 'analytics',
          actionLabel: 'Update ACWR Tracker',
        },
        {
          id: 't-post-3',
          name: 'Hydration & Sleep Target (9+ Hours)',
          detail: 'Fascia requires deep cellular rehydration to slide smoothly during morning doubles.',
          actionTab: null,
          actionLabel: null,
        },
      ],
    },
  ]

  const currentPhase = phases.find((p) => p.id === activePhase)!

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-800">
              TRAINING SCHEDULE INTEGRATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Competitive Swimmer Daily Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Engineered to fit into her daily routine without extra hassle: 5 minutes before practice on deck, quick split checks poolside, and restorative SMR before sleep.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCoachReportModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Coach Report</span>
            </button>
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-slate-300">
                Completed:{' '}
                <strong className="text-cyan-400 font-mono">
                  {completedItems.length}
                </strong>{' '}
                / 9
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {phases.map((phase) => {
          const Icon = phase.icon
          const isSelected = activePhase === phase.id
          return (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id as 'pre' | 'pool' | 'post')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${phase.color} flex items-center justify-center text-white shadow-md`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                  {phase.timing}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{phase.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{phase.summary}</p>
            </button>
          )
        })}
      </div>

      {/* Active Phase Task Checklist */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {currentPhase.title}
              <span className="text-xs font-normal text-slate-400">({currentPhase.timing})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{currentPhase.summary}</p>
          </div>
        </div>

        <div className="space-y-3">
          {currentPhase.tasks.map((task) => {
            const isDone = completedItems.includes(task.id)
            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-950/40 border-emerald-900/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleItem(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 transition-colors ${
                        isDone ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    />
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        isDone ? 'text-slate-400 line-through' : 'text-white'
                      }`}
                    >
                      {task.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{task.detail}</p>
                  </div>
                </div>

                {task.actionTab && (
                  <button
                    onClick={() => onNavigateTab(task.actionTab!)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto flex-shrink-0"
                  >
                    <span>{task.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly Schedule & Periodization Planner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Weekly Training Periodization Calendar</h3>
              <p className="text-xs text-slate-400">
                Target: <strong className="text-white">{swimmerData.weeklyTargetMeters.toLocaleString()}m</strong> • Click days to toggle completion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
              <span>Dryland Gym</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Camera Audit</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {(swimmerData.weeklySchedule || []).map((day) => (
            <div
              key={day.day}
              onClick={() => handleToggleDay(day.day)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 group ${
                day.completed
                  ? 'bg-slate-950/40 border-emerald-800/80 shadow-sm'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{day.label}</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      day.completed ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-cyan-400 font-medium mt-1">{day.type}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Volume:</span>
                  <span className="font-mono text-white font-semibold">
                    {day.targetMeters > 0 ? `${day.targetMeters.toLocaleString()}m` : 'Rest'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {day.hasDryland && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-950 text-amber-300 rounded border border-amber-800">
                      Dryland
                    </span>
                  )}
                  {day.hasCameraAudit && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-cyan-950 text-cyan-300 rounded border border-cyan-800">
                      Vision
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Report Modal */}
      {showCoachReportModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Athlete Coach Summary Report</h3>
              </div>
              <button
                onClick={() => setShowCoachReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Formatted for print, SMS, WhatsApp, or email directly to her swim coach or athletic trainer:
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generateCoachTextSummary()}
            </pre>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Report'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download .TXT File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
