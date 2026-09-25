import React, { useState } from 'react'
import { SMR_PROTOCOLS } from '../../lib/data/smrProtocols'
import type { SMRProtocol } from '../../lib/data/smrProtocols'
import { Sparkles, Play, AlertCircle } from 'lucide-react'

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
    id: 'tp-latissimus',
    name: 'Latissimus Dorsi & Teres Major',
    locationLabel: 'Lateral Scapula & High Ribcage Flank',
    protocolId: 'latissimus-dorsi',
    view: 'posterior',
    x: 65,
    y: 38,
    symptomInWater:
      'Inability to reach streamline without arching lower back; internal rotation tightness that forces the elbow to drop during the pull.',
    palpationTest:
      'Lie side-down over foam roller right below the armpit. Intense tenderness indicates shortened, overworked lat fascia.',
    denizHekmatiAdvice:
      'The primary pulling engine in swimming. Releasing this flank releases rotational drag and restores smooth body roll.',
  },
  {
    id: 'tp-serratus',
    name: 'Serratus Anterior',
    locationLabel: 'Anterior-Lateral Rib Cage (Bra-Line)',
    protocolId: 'serratus-anterior',
    view: 'anterior',
    x: 33,
    y: 40,
    symptomInWater:
      'Inhibited upward rotation of shoulder blade; impingement pinch right at the instant of hand entry into water.',
    palpationTest:
      'Press gently with fingers into the side ribcage between ribs. Tender, tight points restrict rib expansion.',
    denizHekmatiAdvice:
      'The key muscle for upward scapular clearance. When released, your shoulder blade glides smoothly without trapping the rotator cuff.',
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
    <div className="bg-neutral-950 border border-white/15 rounded-2xl p-5 shadow-sm space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
            <Sparkles className="w-5 h-5 text-white" />
            Interactive Swimmer Fascia & Trigger Point Map
          </h3>
          <p className="text-xs text-neutral-400">
            Click any trigger point on the anatomical body map to diagnose tight fascia and launch Coach Hekmati's SMR protocol.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-white/15 self-start sm:self-auto font-mono">
          <button
            onClick={() => {
              setActiveView('anterior')
              setSelectedTp(TRIGGER_POINTS[0])
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'anterior'
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
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
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Posterior (Back)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Anatomical Silhouette Diagram */}
        <div className="lg:col-span-5 relative bg-black border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[380px]">
          <svg
            viewBox="0 0 200 400"
            className="w-full max-w-[200px] h-[360px] text-neutral-800"
          >
            {/* Minimalist Anatomical Silhouette */}
            <circle cx="100" cy="45" r="22" fill="currentColor" />
            {/* Neck */}
            <rect x="92" y="67" width="16" height="15" rx="3" fill="currentColor" />
            {/* Torso */}
            <path
              d="M60 85 L140 85 L125 210 L75 210 Z"
              fill="currentColor"
            />
            {/* Arms */}
            <path
              d="M60 85 L35 180 L30 240 L40 240 L50 185 L65 110 Z"
              fill="currentColor"
            />
            <path
              d="M140 85 L165 180 L170 240 L160 240 L150 185 L135 110 Z"
              fill="currentColor"
            />
            {/* Pelvis & Legs */}
            <path
              d="M75 210 L65 300 L60 375 L75 375 L85 300 L95 230 Z"
              fill="currentColor"
            />
            <path
              d="M125 210 L135 300 L140 375 L125 375 L115 300 L105 230 Z"
              fill="currentColor"
            />
          </svg>

          {/* Trigger point pins on body */}
          {visiblePoints.map((tp) => {
            const isSelected = selectedTp.id === tp.id
            return (
              <button
                key={tp.id}
                onClick={() => setSelectedTp(tp)}
                style={{ left: `${tp.x}%`, top: `${tp.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 group focus:outline-none`}
              >
                <span
                  className={`block rounded-full transition-all ${
                    isSelected
                      ? 'w-5 h-5 bg-white shadow-[0_0_12px_rgba(255,255,255,1)] border-2 border-black'
                      : 'w-3.5 h-3.5 bg-neutral-400 hover:bg-white border border-black'
                  }`}
                />
                <span
                  className={`absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-mono px-2 py-0.5 rounded transition-all ${
                    isSelected
                      ? 'bg-white text-black font-bold border border-white'
                      : 'bg-black text-neutral-300 border border-white/20'
                  }`}
                >
                  {tp.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Diagnosis & Coach Recommendation Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-black border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                  {selectedTp.locationLabel}
                </span>
                <h4 className="text-xl font-bold text-white mt-0.5">
                  {selectedTp.name}
                </h4>
              </div>
              <button
                onClick={handleLaunchProtocol}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Launch SMR Routine</span>
              </button>
            </div>

            {/* In-Water Symptom */}
            <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
              <span className="font-mono font-bold text-neutral-300 uppercase text-[10px] block">
                Symptom in the Pool:
              </span>
              <p className="text-neutral-300 leading-relaxed font-sans">
                {selectedTp.symptomInWater}
              </p>
            </div>

            {/* Palpation Test */}
            <div className="space-y-1 pt-2 border-t border-white/10 text-xs">
              <span className="font-mono font-bold text-neutral-300 uppercase text-[10px] block">
                Palpation Self-Check (How to find it):
              </span>
              <p className="text-neutral-300 leading-relaxed font-sans">
                {selectedTp.palpationTest}
              </p>
            </div>

            {/* Coach Deniz Hekmati Advice */}
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-white/15 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-white" />
                <span className="font-mono font-bold text-white uppercase text-[10px]">
                  Coach Deniz Hekmati Sports Science Directive:
                </span>
              </div>
              <p className="text-neutral-300 leading-relaxed font-sans">
                "{selectedTp.denizHekmatiAdvice}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
