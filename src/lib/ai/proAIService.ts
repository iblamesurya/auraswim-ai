/**
 * AuraSwim AI - Pro Swimming LLM Service
 * Native support for Meta AI (muse-spark-1.3-contributor) via https://api.meta.ai/v1/responses
 * and OpenRouter API models for live Olympic-grade coaching, stroke biomechanics diagnosis,
 * and Commit Swimming workout generation.
 */

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const STORAGE_KEY_API = 'auraswim_api_key_v2'
const STORAGE_KEY_MODEL = 'auraswim_ai_model_v2'

export const DEFAULT_KEY = 'LLM_4863590670632975_HIi8GtvN9Lifvnk_3D-XOn4IiSM'

export const DEFAULT_MODELS = [
  {
    id: 'muse-spark-1.3-contributor',
    label: 'Meta AI Muse Spark 1.3 Contributor (Olympic Biomechanics)',
    endpoint: 'https://api.meta.ai/v1/responses',
    provider: 'meta' as const,
  },
  {
    id: 'deepseek/deepseek-chat',
    label: 'DeepSeek V3 (OpenRouter Sports Science)',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    provider: 'openrouter' as const,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B Instruct (OpenRouter)',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    provider: 'openrouter' as const,
  },
]

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return DEFAULT_KEY
  return localStorage.getItem(STORAGE_KEY_API) || DEFAULT_KEY
}

export function saveStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_API, key.trim())
}

export function getStoredModel(): string {
  if (typeof window === 'undefined') return DEFAULT_MODELS[0].id
  return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODELS[0].id
}

export function saveStoredModel(model: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY_MODEL, model)
}

const SWIMMING_PRO_SYSTEM_PROMPT = `You are AuraSwim Pro AI, an Olympic & NCAA Division 1 competitive swimming biomechanist and strength & conditioning coach.
You are trained on:
1. USA Swimming National Team Biomechanics & Olympic Training Systems (Bob Bowman, Dave Salo, Eddie Reese methodology).
2. Coach Deniz Hekmati's Self-Myofascial Release (SMR) protocols (Pec Minor, Subscapularis, Thoracic Spine, Plantar Fascia, Lats).
3. Professional swimming software analytics:
   - TritonWear (Stroke Rate, Distance Per Stroke, Velocity = SR * DPS, Turn contact times, Stroke Index).
   - Dartfish & Kinovea (Early Vertical Forearm catch angles, body roll symmetry, head position alignment).
   - Commit Swimming (Energy Zones: EN1 Aerobic Base, EN2 Threshold, EN3 VO2 Max, SP1 Lactate Production, SP2 Race Pace, SP3 Alactic Sprint).
   - Omega ARES (15m Breakout velocity, Turn In-5m/Out-5m times, Finish touch decay).
4. Acute:Chronic Workload Ratio (ACWR Gabbett model: keep rolling ratio between 0.80 - 1.30 to avoid rotator cuff tendinopathy).

Rules:
- Give mathematically precise, biomechanically grounded answers.
- Format with clean markdown, bullet points, and LaTeX formulas where helpful (e.g. Velocity = SR * DPS, moment of inertia I = m*r^2).
- When discussing shoulder issues, highlight SMR protocols with lacrosse balls and scapular kinematics.
- Keep advice actionable, encouraging, and elite.`

export async function queryLiveSwimmingAI(
  userQuery: string,
  swimmerContext?: {
    swimmerName?: string
    acwr?: number
    smrStreak?: number
    recentYardage?: number
    shoulderPain?: number
  }
): Promise<{ text: string; modelUsed: string }> {
  const apiKey = getStoredApiKey()
  const model = getStoredModel()

  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  let contextPrompt = ''
  if (swimmerContext) {
    contextPrompt = `\n[ATHLETE CURRENT TELEMETRY:
- Swimmer: ${swimmerContext.swimmerName || 'Competitive Swimmer'}
- Acute:Chronic Workload Ratio (ACWR): ${swimmerContext.acwr ? swimmerContext.acwr.toFixed(2) : 'Awaiting baseline'}
- SMR Streak: ${swimmerContext.smrStreak || 0} days
- Shoulder Pain Score: ${swimmerContext.shoulderPain ?? 'None logged'}/10]\n`
  }

  const selectedModelMeta = DEFAULT_MODELS.find((m) => m.id === model) || DEFAULT_MODELS[0]

  // Branch 1: Meta AI responses endpoint (muse-spark-1.3-contributor)
  if (selectedModelMeta.provider === 'meta' || model.includes('muse-spark')) {
    const response = await fetch('https://api.meta.ai/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'muse-spark-1.3-contributor',
        input: [
          {
            role: 'user',
            content: `${SWIMMING_PRO_SYSTEM_PROMPT}\n\n${contextPrompt}User Question / Coaching Request: ${userQuery}`,
          },
        ],
        temperature: 1,
        max_output_tokens: 4000,
        top_p: 1,
        reasoning: {
          effort: 'medium',
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Meta AI API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    let extractedText = ''

    if (data.output && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === 'message' && Array.isArray(item.content)) {
          for (const c of item.content) {
            if (c.type === 'output_text' && c.text) {
              extractedText += c.text
            }
          }
        }
      }
    }

    if (!extractedText && data.choices?.[0]?.message?.content) {
      extractedText = data.choices[0].message.content
    }

    if (!extractedText) {
      throw new Error('Meta AI returned an empty response. Please verify quota or token limits.')
    }

    return { text: extractedText, modelUsed: model }
  }

  // Branch 2: Standard OpenAI / OpenRouter endpoint
  const messages: LLMMessage[] = [
    { role: 'system', content: SWIMMING_PRO_SYSTEM_PROMPT },
    { role: 'user', content: `${contextPrompt}User Question / Coaching Request: ${userQuery}` },
  ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://iblamesurya.github.io/auraswim-ai/',
      'X-Title': 'AuraSwim AI Pro',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || 'No response returned from model.'
  return { text, modelUsed: model }
}

export async function generateProSwimWorkout(params: {
  focus: 'aerobic_threshold' | 'vo2max_speed' | 'sprint_alactic' | 'im_technical' | 'recovery_taper'
  targetMeters: number
  stroke: 'Freestyle' | 'Butterfly' | 'Backstroke' | 'Breaststroke' | 'IM'
  energyZoneFocus: 'EN1' | 'EN2' | 'EN3' | 'SP1' | 'SP2' | 'SP3'
}): Promise<string> {
  const prompt = `Generate a complete competitive swim workout in Commit Swimming professional syntax for a collegiate/national-level swimmer:
- Target Volume: approximately ${params.targetMeters} meters
- Primary Stroke: ${params.stroke}
- Focus: ${params.focus.replace('_', ' ').toUpperCase()}
- Primary Energy Zone: ${params.energyZoneFocus}

Structure the response with:
1. **Pre-Swim Dryland SMR Activation (6 min)** (Specify lacrosse ball targets: Pec Minor, Subscap, etc.)
2. **Warm-Up (Meters & Sets)**
3. **Pre-Set / Activation (EVF drills & kick)**
4. **Main Set** (Use standard syntax like: 8 x 100 on 1:20 Free @ ${params.energyZoneFocus}, target heart rate / split targets)
5. **Cool-Down (Meters)**
6. **Energy Zone Distribution Table** (EN1/EN2/EN3/SP1/SP2/SP3 breakdown)
7. **Post-Swim Fascial Restoration Protocol**`

  const result = await queryLiveSwimmingAI(prompt)
  return result.text
}
