import React, { useState } from 'react'
import { SMR_PROTOCOLS } from '../../lib/data/smrProtocols'
import type { SMRProtocol } from '../../lib/data/smrProtocols'
import { Sparkles, ArrowRight, Play, AlertCircle, ShieldAlert } from 'lucide-react'

interface FasciaTriggerPoint {
  id: string
  name: string
  locationLabel: string
  protocolId: string
  view: 'anterior' | 'posterior'
  x: number // percent on SVG
  y: number
  symptomInWater: string
  palpationTest: string
  denizHekmatiAdvice: string
}

export const TRIGGER_POINTS: FasciaTriggerPoint[] = [
  {
    id: 'tp-pec-minor',
    name: 'Pectoralis Minor',
    locationLabel: 'Upper Chest / Anterior Shoulder',
    protocolId: 'pec-minor',
    view: 'anterior',
    x: 38,
    y: 28,
    symptomInWater:
      'Pinched ache during high-elbow freestyle/butterfly recovery; rounded shoulder posture that restricts full overhead reach.',
    palpationTest:
      'Pinch the skin and muscle right below your collarbone and inside the shoulder joint. If it feels tender or ropey, the fascia is tight.',
    denizHekmatiAdvice:
      'Pec minor is proven to be significantly shortened in swimmers with shoulder pain. Release with a lacrosse ball before every practice to open up the chest.',
  },
  {
    id: 'tp-subscapularis',
    name: 'Subscapularis',
    locationLabel: 'Deep Armpit / Anterior Scapula',
    protocolId: 'subscapularis',
    view: 'anterior',
    x: 63,
    y: 33,
    symptomInWater:
      'Deep ache inside the shoulder joint during pull-through; compensatory dropping of the elbow in the catch phase.',
    palpationTest:
      'Reach thumb deep into the back wall of your armpit. Press gently into the shoulder blade. A tender, sensitive trigger point is common in swimmers.',
    denizHekmatiAdvice:
      'The most overworked rotator cuff muscle in competitive swimming. Release it using your own hands (palpation) or a mobility ball to restore overhead streamline.',
  },
  {
    id: 'tp-thoracic',
    name: 'Thoracic Spine (T1 - T12)',
    locationLabel: 'Mid-to-Upper Back',
    protocolId: 'thoracic-spine',
    view: 'posterior',
    x: 50,
    y: 35,
    symptomInWater:
      'Stiff body roll; excessive lumbar (lower back) arching when taking a breath; limited dolphin kick wave amplitude.',
    palpationTest:
      'Lie on floor with foam roller across mid-back. If extending backwards feels rigid or causes lower back arching, thoracic fascia is restricted.',
    denizHekmatiAdvice:
      'A stiff upper back forces the delicate shoulder joint to compensate. Never roll the lower back; focus on gentle extensions between T1 and T12.',
  },
  {
    id: 'tp-plantar',
    name: 'Plantar Fascia',
    locationLabel: 'Sole of the Foot / Medial Arch',
    protocolId: 'plantar-fascia',
    view: 'posterior',
    x: 42,
    y: 88,
    symptomInWater:
      'Restricted ankle snap on dolphin kicks; weak push-offs off the start block and flip turns; foot cramps during kick sets.',
    palpationTest:
      'Step firmly on a lacrosse ball right behind the ball of your big toe. Tender nodules indicate dehydrated, stiff plantar fascia.',
    denizHekmatiAdvice:
      'Rolling the foot arch directly increases ankle plantarflexion flexibility, boosting propulsion on flutter and dolphin kicks.',
  },
  {
    id: 'tp-calves',
    name: 'Gastrocnemius & Soleus',
    locationLabel: 'Calf & Achilles Tendon',
    protocolId: 'calves-achilles',
    view: 'posterior',
    x: 57,
    y: 72,
    symptomInWater:
      'Sudden foot/calf cramping during all-out kick sets; delayed wall exit speed on flip turns.',
    palpationTest:
      'Roll across the foam roller with legs crossed. Look for sharp trigger points in the outer and inner calf bellies.',
    denizHekmatiAdvice:
      'Keep calves supple to maintain explosive push-off force off turning walls without fatiguing the Achilles tendon.',
  },
]

interface FasciaBodyMapProps {
  onSelectProtocol: (protocol: SMRProtocol) => void
}

export const FasciaBodyMap: React.FC<FasciaBodyMapProps> = ({ onSelectProtocol }) => {
  const [selectedTp, setSelectedTp] = useState<FasciaTriggerPoint>(TRIGGER_POINTS[0])
  const [activeView, setActiveView] = useState<'anterior' | 'posterior'>('anterior')

  const visiblePoints = TRIGGER_POINTS.filter((tp) => tp.view === activeView)

  const handleLaunchProtocol = () => {
    const protocol = SMR_PROTOCOLS.find((p) => p.id === selectedTp.protocolId)
    if (protocol) {
      onSelectProtocol(protocol)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Interactive Swimmer Fascia & Trigger Point Map
          </h3>
          <p className="text-xs text-slate-400">
            Click any trigger point on the anatomical body map to diagnose tight fascia and launch Coach Hekmati's SMR protocol.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveView('anterior')
              setSelectedTp(TRIGGER_POINTS[0])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'anterior'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Anterior (Front)
          </button>
          <button
            onClick={() => {
              setActiveView('posterior')
              setSelectedTp(TRIGGER_POINTS[2])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'posterior'
                ? 'bg-cyan-500 text-slate-950'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Anatomical Body Canvas with Interactive Hotspots (Left Col: 5 cols) */}
        <div className="md:col-span-5 relative bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[380px]">
          <div className="relative w-[220px] h-[360px]">
            {/* SVG Silhouette */}
            <svg
              viewBox="0 0 200 340"
              className="w-full h-full opacity-40 text-slate-500"
              fill="currentColor"
            >
              {/* Head */}
              <circle cx="100" cy="28" r="20" />
              {/* Neck */}
              <rect x="94" y="47" width="12" height="15" rx="3" />
              {/* Torso */}
              <path d="M60 62 L140 62 L130 180 L70 180 Z" rx="10" />
              {/* Arms */}
              <path d="M56 65 L30 140 L38 210 L48 210 L42 145 L62 80 Z" />
              <path d="M144 65 L170 140 L162 210 L152 210 L158 145 L138 80 Z" />
              {/* Legs */}
              <path d="M72 185 L65 260 L68 325 L86 325 L88 260 L97 185 Z" />
              <path d="M128 185 L135 260 L132 325 L114 325 L112 260 L103 185 Z" />
            </svg>

            {/* Interactive Pins */}
            {visiblePoints.map((tp) => {
              const isSelected = selectedTp.id === tp.id
              return (
                <button
                  key={tp.id}
                  onClick={() => setSelectedTp(tp)}
                  style={{
                    left: `${tp.x}%`,
                    top: `${tp.y}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                  title={tp.name}
                >
                  <span
                    className={`relative flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 scale-125 shadow-lg shadow-cyan-500/50'
                        : 'bg-slate-900 border-2 border-cyan-400 text-cyan-300 hover:scale-110'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-slate-950' : 'bg-cyan-400 animate-ping'
                      }`}
                    ></span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {activeView === 'anterior' ? 'ANTERIOR VIEW (CHEST/ARMS)' : 'POSTERIOR VIEW (BACK/FEET)'}
          </div>
        </div>

        {/* Selected Trigger Point Diagnostic Card (Right Col: 7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                {selectedTp.locationLabel}
              </span>
              <span className="text-xs text-slate-400 font-mono">Active Target</span>
            </div>

            <h4 className="text-xl font-bold text-white">{selectedTp.name}</h4>

            {/* In-Water Symptoms */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Signs of Tight Fascia in the Pool:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedTp.symptomInWater}
              </p>
            </div>

            {/* Deniz Hekmati Palpation Test */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Coach Deniz Hekmati's Palpation Test:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedTp.palpationTest}
              </p>
            </div>

            {/* Sports Science Advice */}
            <div className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              <strong className="text-slate-200">Sports Science Insight: </strong>
              {selectedTp.denizHekmatiAdvice}
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <button
                onClick={handleLaunchProtocol}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Launch Guided SMR Timer for {selectedTp.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
