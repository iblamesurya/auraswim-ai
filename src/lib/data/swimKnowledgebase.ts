export interface KnowledgebaseQuery {
  id: string
  title: string
  category: 'injury_prevention' | 'biomechanics' | 'training_load' | 'pacing' | 'meet_prep'
  prompt: string
  previewText: string
  fullResponse: string
  sources: string[]
}

export const PRESET_QUERIES: KnowledgebaseQuery[] = [
  {
    id: 'shoulder-pinch-fly',
    title: 'Shoulder Pinching in Butterfly / Freestyle',
    category: 'injury_prevention',
    prompt:
      'My sister feels pinching in the front of her shoulder during the high-elbow recovery of butterfly. What SMR and mobility drills should she do?',
    previewText:
      'Target Pec Minor and Subscapularis immediately. Front shoulder pinching is classic subacromial impingement caused by forward-rounded shoulders.',
    fullResponse: `### Diagnostic Breakdown:
Front-shoulder pinching during the recovery or catch phase is classic **Subacromial Impingement Syndrome (Swimmer's Shoulder)**. When a swimmer executes thousands of pulls, the **pectoralis minor** and **subscapularis** become tight and short, pulling the head of the humerus forward and upward. This narrows the subacromial space, compressing the supraspinatus tendon.

### Immediate Action Protocol:
1. **Pec Minor Release (Lacrosse Ball against wall):**
   - 60 seconds per side. Pin the ball into the anterior chest just beneath the collarbone. Inhale, contract for 3s, exhale and sink in for 10s.
2. **Subscapularis Palpation (Fingers in armpit):**
   - 60 seconds per side. Reach thumb deep into posterior armpit wall. Slowly move arm in gentle internal/external rotation.
3. **Thoracic Spine Extensions (Foam roller):**
   - 90 seconds. Stiff thoracic spine forces the shoulder blade to wing, causing joint impingement. Arch gently over roller.
4. **Band Pull-Aparts & External Rotations:**
   - 2 sets of 15 reps with a light resistance band to activate the infraspinatus and lower trapezius before jumping in.

> **Caution:** Do not stretch the front of the shoulder passively (e.g. doorframe pectoral stretch) if she has hypermobility, as this can destabilize the anterior joint capsule. SMR with a ball is far safer.`,
    sources: [
      'Deniz Hekmati: Swimmer Strength SMR Principles (Swimming World)',
      'Pacific University Biomechanics Lab: Predictive Shoulder Injury Modeling in Swimmers (2024)',
      'Journal of Shoulder and Elbow Surgery: Pec Minor Length and Scapular Kinematics in Elite Swimmers',
    ],
  },
  {
    id: 'stroke-rate-dps',
    title: 'Stroke Rate (SR) vs Distance Per Stroke (DPS)',
    category: 'biomechanics',
    prompt:
      'Her stroke rate is 42 strokes/min with 1.80m DPS in 100m freestyle. Should she spin her arms faster or pull longer to break 58 seconds?',
    previewText:
      'Find the non-linear "Biomechanic Sweet Spot". Rushing stroke tempo without anchoring water drops velocity.',
    fullResponse: `### Biomechanical Analysis:
Swimming velocity is governed by the fundamental formula:
$$\\text{Velocity} (v) = \\text{Stroke Rate} (SR) \\times \\text{Distance Per Stroke} (DPS)$$

At **42 strokes/min** (0.70 Hz) and **1.80m DPS**, her current clean swimming speed is approximately **1.26 m/s** (excluding dive start and turns). To break 58 seconds in a 100m freestyle, an elite female swimmer typically needs a clean swimming speed of approximately **1.62 - 1.68 m/s**.

### Research-Backed Recommendations (from 2026 Frontiers in Sports Science):
1. **Avoid the "Spinning Wheels" Trap:** If she increases SR to 50 spm without sufficient strength, DPS often collapses to 1.45m ($50 \\times 1.45 = 1.21$ m/s), resulting in *slower* overall times and acute shoulder exhaustion.
2. **Target Corridor for 100m Freestyle:**
   - Target Stroke Rate: **46 – 48 strokes/min**
   - Target DPS: **1.95 – 2.05 meters/stroke**
3. **Drills to Implement:**
   - **Golf / SWOLF Sets:** $6 \\times 50$m on 1:15 aiming to hold time + strokes under 65.
   - **Early Vertical Forearm (EVF) Catch:** Ensure the forearm rotates vertically *before* the elbow moves backward to maintain paddle surface area.`,
    sources: [
      'Pedagogy of Physical Culture & Sports (2026): Machine Learning Prediction of SL-SR Interaction in Freestyle',
      'Frontiers in Sports & Active Living (2026): Non-linear Interaction between Stroke Length and Rate',
      'TritonWear Whitepapers: Optimal Stroke Corridors in Age-Group Champions',
    ],
  },
  {
    id: 'acwr-spike-warning',
    title: 'Training Yardage Spike & ACWR Calculation',
    category: 'training_load',
    prompt:
      'We increased her weekly meterage from 24,000m to 42,000m this week for holiday training camp. Is this safe or will it cause an injury spike?',
    previewText:
      'Warning: That is a 1.75 ACWR spike into the "Danger Zone". Overuse injury probability rises past 30%.',
    fullResponse: `### Training Load Warning:
Increasing from **24,000m to 42,000m** in a single week represents a **75% volume surge**!
$$\\text{ACWR} = \\frac{\\text{Acute Load (This Week: 42,000)}}{\\text{Chronic Load (Baseline: 24,000)}} = 1.75$$

In modern sports science (Gabbett ACWR Model), an ACWR above **1.50** is designated as the **"Danger Zone"**. Research indicates that injury probability increases by **2 to 4 times**, with the primary risk in swimmers being:
- Rotator cuff tendinopathy (supraspinatus / infraspinatus)
- Biceps brachii long head tendon inflammation
- Spondylolysis / lumbar hyperextension stress in butterfly/breaststroke

### How to Mitigate Risk Immediately:
1. **Reduce Paddle Usage:** Ban large power paddles this week; they increase shoulder joint torque exponentially under fatigue.
2. **Mandate Pre-Swim SMR (8 min):** Roll pecs, subscapularis, and thoracic spine before every single practice.
3. **Insert Aerobic Kick Sets:** If the coach wants cardio volume, substitute 4,000m of swimming with kickboard or streamline kicking to unload the shoulders.
4. **Sleep & Nutrition:** Ensure minimum 9 hours of sleep with adequate carbohydrate refuels to rebuild glycogen stores.`,
    sources: [
      'Gabbett, T. J. (2016): The training-injury prevention paradox: should athletes be training smarter and harder?',
      'Hellard et al. (2021): Bayesian networks modeling training impulse and illness in elite swimmers',
      'American Journal of Sports Medicine: Monitoring workload and overuse injuries in adolescent athletes',
    ],
  },
  {
    id: 'meet-warmup-routine',
    title: 'Pre-Race Meet Deck Warm-Up Routine',
    category: 'meet_prep',
    prompt:
      'What is an ideal 10-minute dryland activation and SMR routine before racing at a swim meet?',
    previewText:
      '10-minute sequential protocol: SMR tissue release -> dynamic mobility -> CNS priming.',
    fullResponse: `### 10-Minute Pre-Race Activation Sequence:

#### Minutes 0:00 - 3:00 | SMR Tissue Release (Lacrosse Ball)
- **Feet (Plantar Fascia):** 45 sec per foot. Roll with moderate pressure to awaken foot proprioception for explosive dive starts and flip turns.
- **Pec Minor:** 45 sec per side. Release chest against a doorway or concrete pillar to ensure free overhead streamline.

#### Minutes 3:00 - 6:00 | Dynamic Range of Motion
- **Arm Circles with Trunk Rotation:** 10 forward, 10 backward (smooth, gradual amplitude).
- **Cat-Cow / Thoracic Extensions:** 8 reps emphasizing upper back arch, not lower back sag.
- **Deep Squat with Overhead Reach:** 6 reps holding bottom for 2 seconds.

#### Minutes 6:00 - 8:30 | Muscle Activation (Mini-Band)
- **External Rotations (Elbows at side):** 12 reps per side to fire rotator cuff.
- **Band Pull-Aparts:** 15 reps pinching shoulder blades together.
- **Glute Bridges or Monster Walks:** 12 reps to activate hip extensors for block start explosion.

#### Minutes 8:30 - 10:00 | Central Nervous System (CNS) Potentiation
- **Vertical Jump & Stick:** 3 explosive counter-movement jumps.
- **Fast-Feet / High Knees:** 2 bursts of 5 seconds to spike nervous system readiness.
- *Head to ready room alert, loose, and primed.*`,
    sources: [
      'Deniz Hekmati: Age-Group & Elite Meet Warm-Up Protocols',
      'Journal of Strength and Conditioning Research: Post-activation potentiation in competitive sprinters',
      'Sports Biomechanics: Dryland priming and swimming start performance',
    ],
  },
  {
    id: 'underwater-dolphin-kick',
    title: 'Underwater Dolphin Kick Breakout Optimization',
    category: 'biomechanics',
    prompt:
      'How deep should she stay on the underwater dolphin kick off the start and turns for maximum speed?',
    previewText:
      'Hydrodynamic sweet spot: 0.9m to 1.2m depth to eliminate surface wave drag.',
    fullResponse: `### Hydrodynamic Science:
When a swimmer moves near the surface ($< 0.5$m deep), they generate **wave drag** (bow waves and transverse waves), which consumes up to **60% of total propulsive energy**.

### Optimal Depth & Breakout Guidelines (from CFD and AI flume studies):
1. **Optimal Gliding Depth:** **0.9m to 1.2m** beneath the surface. At this depth, wave resistance drops to near zero, leaving only passive skin-friction drag.
2. **Kick Initiation Timing:**
   - Do not kick immediately off the wall. Allow the initial glide to carry speed until velocity matches kicking velocity ($\approx 1.8 - 2.0$ m/s), then initiate kicks.
3. **Kicking Mechanics:**
   - Power must originate from the **core and hips**, not by solely bending the knees. Excessive knee bend ($> 90^\circ$) creates a huge frontal drag cavity.
   - Ankle plantarflexion is paramount: an extra $5^\circ$ of ankle flexion delivers up to $14\\%$ more propulsive vortex thrust.
4. **Breakout Angle:** Ascend smoothly at a $15^\circ - 20^\circ$ angle. The first arm pull must begin while the head is still breaking the surface to maintain seamless momentum.`,
    sources: [
      'Lyttle et al.: Hydrodynamic drag during underwater gliding at various depths (Journal of Biomechanics)',
      'von Loebbecke et al.: CFD modeling of vortex shedding during underwater dolphin kick',
      'Veiga et al.: Optimal breakout distance and velocity decay in international finalists (IJSPP)',
    ],
  },
]
