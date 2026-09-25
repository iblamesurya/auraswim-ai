export interface Env {
  DB: D1Database
  AI_API_KEY?: string
  AI_MODEL?: string
}

const DEFAULT_AI_KEY = 'LLM_4863590670632975_HIi8GtvN9Lifvnk_3D-XOn4IiSM'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const OLYMPIC_SYSTEM_PROMPT = `You are the AuraSwim Olympic Intelligence Coach, a world-class competitive swimming biomechanist and exercise physiologist.
Your knowledge is grounded in:
1. USA Swimming National Team Biomechanics & Olympic Training Systems (Bob Bowman, Dave Salo methodology).
2. Coach Deniz Hekmati's Self-Myofascial Release (SMR) protocols (Pec Minor, Subscapularis, Thoracic Spine, Plantar Fascia, Lats).
3. Professional swimming software analytics:
   - TritonWear (Stroke Rate, Distance Per Stroke, Velocity = SR * DPS, Turn contact times, Stroke Index).
   - Dartfish (Early Vertical Forearm catch angles, body roll symmetry, head position alignment).
   - Commit Swimming (Energy Zones: EN1 Aerobic Base, EN2 Threshold, EN3 VO2 Max, SP1 Lactate Production, SP2 Race Pace, SP3 Alactic Sprint).
   - Omega ARES (15m Breakout velocity, Turn In/Out decay).
4. Acute:Chronic Workload Ratio (ACWR Gabbett model: keep rolling ratio between 0.80 - 1.30 to avoid rotator cuff tendinopathy).

Rules:
- Deliver mathematically precise, biomechanically grounded answers.
- Format with clean markdown, bullet points, and LaTeX formulas ($v = SR \\times DPS$).
- When discussing shoulder issues, highlight SMR protocols with lacrosse balls and scapular kinematics.
- Never disclose underlying third-party LLM providers, brand identities, or raw infrastructure details. You are exclusively AuraSwim Olympic Intelligence.`

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders, status: 204 })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      // Health check
      if (path === '/api/health' && request.method === 'GET') {
        return new Response(
          JSON.stringify({
            status: 'online',
            engine: 'AuraSwim Olympic Intelligence',
            database: 'Cloudflare D1 Active',
            timestamp: new Date().toISOString(),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Secure AI Chat Proxy (White-labeled, zero CORS browser issues)
      if (path === '/api/chat' && request.method === 'POST') {
        const body: any = await request.json()
        const userQuery = body.userQuery || ''
        const swimmerContext = body.swimmerContext
        const apiKey = env.AI_API_KEY || body.apiKey || DEFAULT_AI_KEY

        let contextPrompt = ''
        if (swimmerContext) {
          contextPrompt = `\n[ATHLETE REAL-TIME BIOMECHANICAL TELEMETRY:
- Athlete: ${swimmerContext.swimmerName || 'Competitive Swimmer'}
- Acute:Chronic Workload Ratio (ACWR): ${swimmerContext.acwr ? Number(swimmerContext.acwr).toFixed(2) : 'Awaiting baseline'}
- SMR Recovery Streak: ${swimmerContext.smrStreak || 0} days
- Shoulder Pain Score (VAS 0-10): ${swimmerContext.shoulderPain ?? 'None logged'}/10
${swimmerContext.latestEvfAngle ? `- Last Measured EVF Catch Angle: ${swimmerContext.latestEvfAngle}°` : ''}
${swimmerContext.latestStreamlineAngle ? `- Last Measured Overhead Streamline: ${swimmerContext.latestStreamlineAngle}°` : ''}
${swimmerContext.hasLumbarCheat ? `- Lumbar Hyperextension / Anterior Pelvic Tilt Detected: YES (+28% passive drag penalty)` : ''}
${swimmerContext.latestIdcMode ? `- Index of Coordination (IdC): ${swimmerContext.latestIdcMode.toUpperCase()}` : ''}
${swimmerContext.latestStrokeIndex ? `- Stroke Index (SI): ${swimmerContext.latestStrokeIndex} m²/s` : ''}]\n`
        }

        const metaResponse = await fetch('https://api.meta.ai/v1/responses', {
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
                content: `${OLYMPIC_SYSTEM_PROMPT}\n\n${contextPrompt}User Question / Coaching Request: ${userQuery}`,
              },
            ],
            stream: false,
            temperature: 0.7,
            max_output_tokens: 3000,
            top_p: 1,
            reasoning: { effort: 'low' },
          }),
        })

        if (!metaResponse.ok) {
          const errText = await metaResponse.text()
          return new Response(
            JSON.stringify({ error: `Neural Engine Error (${metaResponse.status}): ${errText}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 }
          )
        }

        const data: any = await metaResponse.json()
        let text = ''
        if (data.output && Array.isArray(data.output)) {
          for (const item of data.output) {
            if (item.type === 'message' && Array.isArray(item.content)) {
              for (const part of item.content) {
                if (part.type === 'output_text' && part.text) {
                  text += part.text
                }
              }
            } else if (item.content && typeof item.content === 'string') {
              text += item.content
            }
          }
        } else if (data.response) {
          text = data.response
        }

        // White-label: strip any stray third-party provider names
        text = text.replace(/Meta AI/gi, 'AuraSwim AI')

        return new Response(
          JSON.stringify({
            text: text || 'AuraSwim Olympic Intelligence analysis complete.',
            modelUsed: 'AuraSwim Olympic Intelligence Engine',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Workouts: List
      if (path === '/api/workouts' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM workouts ORDER BY date DESC, created_at DESC LIMIT 100;'
        ).all()
        return new Response(JSON.stringify({ workouts: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Workouts: Create
      if (path === '/api/workouts' && request.method === 'POST') {
        const w: any = await request.json()
        const id = w.id || `w-${Date.now()}`
        const now = new Date().toISOString()
        await env.DB.prepare(
          'INSERT INTO workouts (id, date, meters, duration_min, rpe_scale, stroke_rate_spm, dps_meters, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);'
        )
          .bind(
            id,
            w.date || now.split('T')[0],
            Number(w.meters) || 0,
            Number(w.durationMin) || 60,
            Number(w.rpeScale1to10) || 5,
            w.strokeRateSpm ? Number(w.strokeRateSpm) : null,
            w.dpsMeters ? Number(w.dpsMeters) : null,
            w.notes || null,
            now
          )
          .run()

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Shoulder Logs: List
      if (path === '/api/shoulder' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM shoulder_logs ORDER BY date DESC, created_at DESC LIMIT 100;'
        ).all()
        return new Response(JSON.stringify({ shoulderLogs: results || [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Shoulder Logs: Create
      if (path === '/api/shoulder' && request.method === 'POST') {
        const s: any = await request.json()
        const id = s.id || `s-${Date.now()}`
        const now = new Date().toISOString()
        const triggerPointsStr = Array.isArray(s.triggerPointsNoted) ? JSON.stringify(s.triggerPointsNoted) : null
        await env.DB.prepare(
          'INSERT INTO shoulder_logs (id, date, pain_scale, affected_side, trigger_points, mobility_score, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
        )
          .bind(
            id,
            s.date || now.split('T')[0],
            Number(s.painScale1to10) || 0,
            s.affectedSide || 'none',
            triggerPointsStr,
            Number(s.mobilityScore1to100) || 100,
            s.notes || null,
            now
          )
          .run()

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Profile: Get & Update
      if (path === '/api/profile' && request.method === 'GET') {
        const profile = await env.DB.prepare('SELECT * FROM profile WHERE id = "default_athlete" LIMIT 1;').first()
        return new Response(JSON.stringify({ profile: profile || null }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (path === '/api/profile' && request.method === 'POST') {
        const p: any = await request.json()
        const now = new Date().toISOString()
        await env.DB.prepare(`
          INSERT INTO profile (id, swimmer_name, weekly_target_meters, smr_streak_days, last_smr_date, updated_at)
          VALUES ('default_athlete', ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            swimmer_name = excluded.swimmer_name,
            weekly_target_meters = excluded.weekly_target_meters,
            smr_streak_days = excluded.smr_streak_days,
            last_smr_date = excluded.last_smr_date,
            updated_at = excluded.updated_at;
        `)
          .bind(
            p.swimmerName || 'Competitive Swimmer',
            Number(p.weeklyTargetMeters) || 30000,
            Number(p.smrStreakDays) || 0,
            p.lastSmrDate || null,
            now
          )
          .run()

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  },
}
