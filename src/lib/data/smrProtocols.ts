export interface SMRProtocol {
  id: string
  name: string
  targetMuscle: string
  equipment: 'Lacrosse Ball' | 'Foam Roller' | 'Fingers / Hands'
  durationSec: number
  prepTimeSec: number
  category: 'upper_body' | 'lower_body' | 'spine'
  importanceForSwimmer: string
  contractRelaxTechnique: string
  stepByStep: string[]
  visualTip: string
  warning: string
}

export const SMR_PROTOCOLS: SMRProtocol[] = [
  {
    id: 'pec-minor',
    name: 'Pec Minor & Anterior Chest Release',
    targetMuscle: 'Pectoralis Minor & Coracoid Attachment',
    equipment: 'Lacrosse Ball',
    durationSec: 60,
    prepTimeSec: 5,
    category: 'upper_body',
    importanceForSwimmer:
      'Shown in sports science to be significantly shorter in swimmers with shoulder pain. Releasing it stops the shoulders from slouching forward, preventing subacromial impingement during the catch and high-elbow recovery.',
    contractRelaxTechnique:
      'When you pin a tender spot against the wall, take a deep belly breath. Contract the chest into the ball for 3 seconds, then exhale and allow your shoulder to melt around the ball for 10 seconds.',
    stepByStep: [
      'Locate the bony protrusion at the front of your shoulder (coracoid process) and move slightly down and inwards.',
      'Place a lacrosse ball or tennis ball directly on that tender knot.',
      'Lean your chest into a flat wall or doorframe, applying moderate bodyweight pressure.',
      'Gently sweep your arm across your back or up into streamline to mobilize the tissue.',
      'Repeat on the opposite side.',
    ],
    visualTip: 'Stand at a 45-degree angle to the wall so your head and neck stay neutral.',
    warning: 'Do not roll directly over the collarbone (clavicle) or the armpit artery.',
  },
  {
    id: 'subscapularis',
    name: 'Subscapularis & High Lat Release',
    targetMuscle: 'Subscapularis (Rotator Cuff) & Latissimus Dorsi Insertion',
    equipment: 'Fingers / Hands',
    durationSec: 60,
    prepTimeSec: 5,
    category: 'upper_body',
    importanceForSwimmer:
      'The deepest rotator cuff muscle on the anterior surface of the scapula. It powers internal rotation during every single pull phase and gets chronically overworked and tight.',
    contractRelaxTechnique:
      'Hook your thumb into the back wall of your armpit. Deeply exhale, gently internally and externally rotate your wrist, allowing the muscle fibers to slide under your grip.',
    stepByStep: [
      'Relax your arm down by your side or support it on a table.',
      'Reach with the opposite hand and insert your thumb deep into the armpit toward the back edge of the shoulder blade.',
      'Pinch the muscle belly between your thumb and fingers (palpation technique).',
      'Hold tender areas while slowly moving the target arm through a mini catch motion.',
      'Switch sides after 45-60 seconds.',
    ],
    visualTip: 'If fingers get tired, use a smooth lacrosse ball resting on an elevated yoga block.',
    warning: 'Avoid sharp nerve sensations. It should feel like a deep muscle knot release.',
  },
  {
    id: 'thoracic-spine',
    name: 'Thoracic Spine Extension & Rotation',
    targetMuscle: 'Thoracic Spine (T1-T12) & Erector Spinae',
    equipment: 'Foam Roller',
    durationSec: 90,
    prepTimeSec: 5,
    category: 'spine',
    importanceForSwimmer:
      'Essential for body roll in freestyle and backstroke, high head position in breaststroke breathing, and undulating dolphin kicks. A stiff upper back forces the shoulder joints to over-rotate, creating joint friction.',
    contractRelaxTechnique:
      'Inhale at neutral, exhale as you gently arch your upper back over the roller. Hold for 3 breaths at each vertebral segment.',
    stepByStep: [
      'Sit on the floor and place the foam roller across your mid-back (bra-line level).',
      'Support the back of your head and neck with interlocked hands, keeping elbows pointed up.',
      'Keep hips on the floor and gently extend backwards over the roller.',
      'Perform 3-5 gentle extensions, then shift the roller 1-2 inches higher towards your shoulder blades.',
      'Add gentle side-to-side torso rotation to release ribs and intercostals.',
    ],
    visualTip: 'Never roll the lumbar spine (lower back) directly—keep the roller between mid-back and base of neck.',
    warning: 'Keep elbows pointed forward to keep the scapulae spread apart for deep spine access.',
  },
  {
    id: 'plantar-fascia',
    name: 'Plantar Fascia & Foot Arch Activation',
    targetMuscle: 'Plantar Aponeurosis & Intrinsic Foot Flexors',
    equipment: 'Lacrosse Ball',
    durationSec: 60,
    prepTimeSec: 5,
    category: 'lower_body',
    importanceForSwimmer:
      'The foundation of flip turn push-offs and block starts. Freeing the plantar fascia increases ankle plantarflexion range of motion, translating directly into faster flutter and dolphin kicks.',
    contractRelaxTechnique:
      'Pin the ball right behind the ball of the big toe. Curl your toes tightly over the ball for 3 seconds, then spread your toes wide for 5 seconds as you roll back toward the heel.',
    stepByStep: [
      'Stand or sit on a chair with a lacrosse or golf ball on the floor.',
      'Place the sole of your bare foot on the ball and apply moderate downward pressure.',
      'Slowly roll from the heel along the medial arch to the base of the toes.',
      'Pause on tender knots and perform toe flexions and extensions.',
      'Spend 60 seconds per foot before dryland or water entry.',
    ],
    visualTip: 'Roll in both longitudinal strokes (heel to toe) and lateral sweeps (across the arch).',
    warning: 'Do not press aggressively on the calcaneus (heel bone).',
  },
  {
    id: 'calves-achilles',
    name: 'Calves & Soleus Trigger Point Release',
    targetMuscle: 'Gastrocnemius, Soleus & Achilles Tendon',
    equipment: 'Foam Roller',
    durationSec: 60,
    prepTimeSec: 5,
    category: 'lower_body',
    importanceForSwimmer:
      'Prevents swimmer toe and foot cramping during intense kick sets and enables explosive ankle snap during dolphin kicks.',
    contractRelaxTechnique:
      'Cross one leg over the other on the roller to double the pressure. Rotate your foot in slow circles (ankle pumps) to dynamically mobilize the muscle underneath.',
    stepByStep: [
      'Sit on the floor with your lower legs resting across the foam roller.',
      'Lift your hips off the ground using your hands and slowly roll from ankle to just below the knee.',
      'Turn your toes inward and outward to target both the inner and outer calf bellies.',
      'Pause on the most tender knot and pump your ankle up and down 5 times.',
    ],
    visualTip: 'Stack the opposite leg on top if you need deeper myofascial penetration.',
    warning: 'Never roll the soft tissue behind the knee (popliteal fossa).',
  },
]
