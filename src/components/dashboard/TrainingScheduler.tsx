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
          detail: '30s check in front of camera. Verifies overhead reach is at 170°+ without back arching.',
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
          name: 'Early Vertical Forearm (EVF) Catch Check',
          detail: 'Analyze high-elbow catch angle (110°-130°) and prevent elbow slippage during pull phase.',
          actionTab: 'pro-suite',
          actionLabel: 'Open Video Caliper',
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
          actionTab: 'journal',
          actionLabel: 'Log in Journal',
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
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono tracking-wider text-neutral-300 uppercase bg-black px-2.5 py-1 rounded border border-white/20">
              TRAINING SCHEDULE INTEGRATION
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 tracking-tight">
              Competitive Swimmer Daily Protocol
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
              Engineered to fit into her daily training schedule: 5 minutes before practice on deck, quick split checks poolside, and restorative SMR before sleep.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCoachReportModal(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export Coach Report</span>
            </button>
            <div className="flex items-center gap-2 bg-black px-3.5 py-2 rounded-xl border border-white/15 font-mono">
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="text-xs text-neutral-300">
                Completed: <strong className="text-white">{completedItems.length}</strong> / 9
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
                  ? 'bg-neutral-950 border-white text-white'
                  : 'bg-black border-white/15 text-neutral-400 hover:border-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    isSelected ? 'bg-white text-black' : 'bg-neutral-900 text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-white/10 px-2 py-0.5 rounded">
                  {phase.timing}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">{phase.title}</h3>
              <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{phase.summary}</p>
            </button>
          )
        })}
      </div>

      {/* Active Phase Task Checklist */}
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {currentPhase.title}
              <span className="text-xs font-normal text-neutral-400">({currentPhase.timing})</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">{currentPhase.summary}</p>
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
                    ? 'bg-black/60 border-white/30'
                    : 'bg-black border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleItem(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 transition-colors ${
                        isDone ? 'text-white' : 'text-neutral-600 hover:text-white'
                      }`}
                    />
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-semibold ${
                        isDone ? 'text-neutral-500 line-through' : 'text-white'
                      }`}
                    >
                      {task.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{task.detail}</p>
                  </div>
                </div>

                {task.actionTab && (
                  <button
                    onClick={() => onNavigateTab(task.actionTab!)}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white border border-white/20 text-xs font-medium flex items-center gap-1.5 transition-colors self-start sm:self-auto flex-shrink-0"
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
      <div className="bg-neutral-950 border border-white/15 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Weekly Training Periodization Calendar</h3>
              <p className="text-xs text-neutral-400">
                Target: <strong className="text-white font-mono">{swimmerData.weeklyTargetMeters > 0 ? `${swimmerData.weeklyTargetMeters.toLocaleString()}m` : 'Configure Target'}</strong> • Tap days to log completion
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Dumbbell className="w-3.5 h-3.5 text-white" />
              <span>Dryland</span>
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <Camera className="w-3.5 h-3.5 text-white" />
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
                  ? 'bg-neutral-900 border-white text-white'
                  : 'bg-black border-white/15 hover:border-white/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{day.label}</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      day.completed ? 'text-white' : 'text-neutral-600 group-hover:text-neutral-400'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-neutral-400 font-medium mt-1">{day.type}</p>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">Volume:</span>
                  <span className="text-white font-semibold">
                    {day.targetMeters > 0 ? `${day.targetMeters.toLocaleString()}m` : 'Rest'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {day.hasDryland && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-neutral-900 text-neutral-300 rounded border border-white/15">
                      Dryland
                    </span>
                  )}
                  {day.hasCameraAudit && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-neutral-900 text-neutral-300 rounded border border-white/15">
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
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold text-white">Athlete Coach Summary Report</h3>
              </div>
              <button
                onClick={() => setShowCoachReportModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Generated directly from athlete logs for SMS, WhatsApp, or email to her swim coach or athletic trainer:
            </p>

            <pre className="p-4 rounded-xl bg-black border border-white/15 text-xs font-mono text-neutral-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {generateCoachTextSummary()}
            </pre>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                {copiedReport ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-neutral-400" />}
                <span>{copiedReport ? 'Copied to Clipboard!' : 'Copy Report'}</span>
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
