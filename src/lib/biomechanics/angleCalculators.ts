export interface Point2D {
  x: number
  y: number
  score?: number
}

/**
 * Calculates the interior angle in degrees at vertex B formed by points A - B - C
 */
export function calculateAngle(a: Point2D, b: Point2D, c: Point2D): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x)
  let angle = Math.abs((radians * 180.0) / Math.PI)

  if (angle > 180.0) {
    angle = 360.0 - angle
  }

  return Math.round(angle * 10) / 10
}

/**
 * Early Vertical Forearm (EVF) Catch Angle Analysis
 * Vertex is the elbow (Shoulder -> Elbow -> Wrist)
 */
export function calculateEarlyVerticalForearm(
  shoulder: Point2D,
  elbow: Point2D,
  wrist: Point2D
): {
  angle: number
  status: 'optimal' | 'acceptable' | 'dropped_elbow' | 'over_flexed'
  color: string
  feedback: string
} {
  const angle = calculateAngle(shoulder, elbow, wrist)

  if (angle >= 100 && angle <= 125) {
    return {
      angle,
      status: 'optimal',
      color: 'text-emerald-400',
      feedback:
        'Optimal Early Vertical Forearm (EVF)! High elbow position generates maximal forward propulsion surface without shoulder impingement stress.',
    }
  }

  if (angle > 125 && angle <= 145) {
    return {
      angle,
      status: 'acceptable',
      color: 'text-amber-400',
      feedback:
        'Acceptable catch angle, but elbow is starting to drop. Focus on anchoring the forearm like a paddle before driving back.',
    }
  }

  if (angle > 145) {
    return {
      angle,
      status: 'dropped_elbow',
      color: 'text-rose-400',
      feedback:
        'Dropped elbow detected! Arm is slipping through the water and pushing down instead of back. This increases rotator cuff strain and reduces propulsion.',
    }
  }

  return {
    angle,
    status: 'over_flexed',
    color: 'text-cyan-400',
    feedback:
      'Over-flexed catch (<100°). Reaching too close to body, reducing stroke length and leverage.',
  }
}

/**
 * Streamline & Shoulder Flexion Test
 * Measures active overhead shoulder reach angle (Hip -> Shoulder -> Wrist)
 */
export function calculateStreamlineFlexion(
  hip: Point2D,
  shoulder: Point2D,
  wrist: Point2D
): {
  angle: number
  status: 'excellent' | 'adequate' | 'restricted'
  alignmentScore: number
  feedback: string
} {
  const angle = calculateAngle(hip, shoulder, wrist)

  // 180 deg is a completely straight vertical streamline
  const deviation = Math.abs(180 - angle)
  const alignmentScore = Math.max(0, Math.min(100, Math.round(100 - deviation * 2.5)))

  if (angle >= 170) {
    return {
      angle,
      status: 'excellent',
      alignmentScore,
      feedback:
        'Full thoracic and lat mobility! Perfect hydrodynamic streamline for push-offs, starts, and breakouts.',
    }
  }

  if (angle >= 155 && angle < 170) {
    return {
      angle,
      status: 'adequate',
      alignmentScore,
      feedback:
        'Moderate shoulder flexion. Slight lat or pec tightness restricting full overhead lock. Pre-swim foam rolling on lats recommended.',
    }
  }

  return {
    angle,
    status: 'restricted',
    alignmentScore,
    feedback:
      'Restricted shoulder flexion (<155°). Compensating with lumbar arching. High risk of swimmer shoulder impingement. Perform Pec Minor & Subscapularis SMR before entering pool!',
  }
}

/**
 * Bilateral Stroke Asymmetry Analysis
 */
export function calculateBilateralAsymmetry(
  leftStrokeDurationSec: number,
  rightStrokeDurationSec: number
): {
  asymmetryPercentage: number
  dominantSide: 'left' | 'right' | 'balanced'
  riskLevel: 'low' | 'moderate' | 'high'
  recommendation: string
} {
  if (leftStrokeDurationSec <= 0 || rightStrokeDurationSec <= 0) {
    return {
      asymmetryPercentage: 0,
      dominantSide: 'balanced',
      riskLevel: 'low',
      recommendation: 'Enter valid stroke cycle durations.',
    }
  }

  const diff = Math.abs(leftStrokeDurationSec - rightStrokeDurationSec)
  const avg = (leftStrokeDurationSec + rightStrokeDurationSec) / 2
  const asymmetryPercentage = Math.round((diff / avg) * 1000) / 10

  let dominantSide: 'left' | 'right' | 'balanced' = 'balanced'
  if (leftStrokeDurationSec > rightStrokeDurationSec * 1.03) {
    dominantSide = 'left'
  } else if (rightStrokeDurationSec > leftStrokeDurationSec * 1.03) {
    dominantSide = 'right'
  }

  if (asymmetryPercentage <= 5) {
    return {
      asymmetryPercentage,
      dominantSide,
      riskLevel: 'low',
      recommendation:
        'Symmetrical pull forces detected. Low risk of unilateral shoulder overuse.',
    }
  }

  if (asymmetryPercentage <= 12) {
    return {
      asymmetryPercentage,
      dominantSide,
      riskLevel: 'moderate',
      recommendation: `Moderate asymmetry (${asymmetryPercentage}%). The ${dominantSide} arm is spending longer in pull/propulsion, often due to breathing preference. Practice bilateral breathing drills.`,
    }
  }

  return {
    asymmetryPercentage,
    dominantSide,
    riskLevel: 'high',
    recommendation: `Severe asymmetry (${asymmetryPercentage}%). Significant unilateral loading on the ${dominantSide} shoulder. High correlation with swimmer's shoulder tendinopathy. Release subscapularis and check catch mechanics.`,
  }
}

/**
 * 4-Point Streamline with Lumbar Compensation & Hydrodynamic Drag Penalty
 * Detects whether the swimmer is achieving overhead reach via compensatory lumbar hyperextension (anterior pelvic tilt).
 * Lyttle et al. (2000) & Vorontsov passive drag model.
 */
export function calculateStreamlineWithLumbarCompensation(params: {
  ankle: Point2D
  hip: Point2D
  lumbar: Point2D
  shoulder: Point2D
  wrist: Point2D
}): {
  overheadFlexionAngle: number
  lumbarLordosisDeviationPx: number
  hasLumbarCheat: boolean
  passiveDragPenaltyMultiplier: number
  status: 'elite_streamline' | 'adequate' | 'lumbar_compensated' | 'restricted'
  feedback: string
} {
  const { ankle, hip, lumbar, shoulder, wrist } = params

  // 1. Overhead flexion angle (Hip -> Shoulder -> Wrist)
  const overheadFlexionAngle = calculateAngle(hip, shoulder, wrist)

  // 2. Ideal plumb line between ankle and shoulder
  // Distance of lumbar point from line connecting ankle to shoulder
  const num = Math.abs(
    (shoulder.y - ankle.y) * lumbar.x -
    (shoulder.x - ankle.x) * lumbar.y +
    shoulder.x * ankle.y -
    shoulder.y * ankle.x
  )
  const den = Math.sqrt(
    Math.pow(shoulder.y - ankle.y, 2) + Math.pow(shoulder.x - ankle.x, 2)
  )
  const lumbarLordosisDeviationPx = den > 0 ? Math.round((num / den) * 10) / 10 : 0

  // If lumbar arch deviation is significant (> 18px on normalized canvas) while overhead angle looks high,
  // the swimmer is cheating overhead reach by dumping into anterior pelvic tilt!
  const hasLumbarCheat = lumbarLordosisDeviationPx > 18

  // Passive drag penalty: An arched back drops the legs and increases frontal area A by up to 35%
  let passiveDragPenaltyMultiplier = 1.0
  let status: 'elite_streamline' | 'adequate' | 'lumbar_compensated' | 'restricted' = 'elite_streamline'
  let feedback = 'Elite hydrodynamic streamline! Neutral spine alignment with zero compensatory pelvic tilt.'

  if (hasLumbarCheat) {
    status = 'lumbar_compensated'
    passiveDragPenaltyMultiplier = 1.28 // +28% passive drag from dropped hips
    feedback = `Lumbar compensation detected! You are achieving ${overheadFlexionAngle}° reach by arching your lower back (${lumbarLordosisDeviationPx}px lordotic curve). In the pool, this drops your hips and increases frontal drag by ~28%. Mobilize lats and engage core.`
  } else if (overheadFlexionAngle < 155) {
    status = 'restricted'
    passiveDragPenaltyMultiplier = 1.35
    feedback = `Severely restricted overhead shoulder flexion (${overheadFlexionAngle}°). Inability to streamline increases off-the-wall passive drag by ~35%. Focus on Pec Minor & Subscapularis SMR.`
  } else if (overheadFlexionAngle < 170) {
    status = 'adequate'
    passiveDragPenaltyMultiplier = 1.10
    feedback = `Adequate streamline (${overheadFlexionAngle}°), but slight restriction in upper thoracic spine. Minor drag penalty (+10%).`
  }

  return {
    overheadFlexionAngle,
    lumbarLordosisDeviationPx,
    hasLumbarCheat,
    passiveDragPenaltyMultiplier,
    status,
    feedback,
  }
}

/**
 * 3D Torso Roll Perspective Foreshortening EVF Compensator
 * Corrects 2D planar elbow catch angles based on athlete torso roll along the longitudinal axis (Dr. Rod Havriluk, Aquanex).
 */
export function calculateEVF3D(
  shoulder: Point2D,
  elbow: Point2D,
  wrist: Point2D,
  torsoRollDeg: number = 0
): {
  raw2dAngle: number
  corrected3dAngle: number
  torsoRollDeg: number
  status: 'optimal' | 'acceptable' | 'dropped_elbow' | 'over_flexed'
  feedback: string
} {
  const raw2dAngle = calculateAngle(shoulder, elbow, wrist)

  // When torso rolls by phi degrees, 2D projection foreshortens the upper arm vector
  const rollRad = (Math.abs(torsoRollDeg) * Math.PI) / 180
  // Geometric correction factor for perspective foreshortening along roll axis
  const rollCorrection = Math.cos(rollRad) > 0 ? (1 - Math.cos(rollRad)) * 12 : 0

  const corrected3dAngle = Math.round((raw2dAngle - rollCorrection) * 10) / 10

  let status: 'optimal' | 'acceptable' | 'dropped_elbow' | 'over_flexed' = 'optimal'
  let feedback = 'Optimal Early Vertical Forearm! Forearm paddle is vertical relative to water flow.'

  if (corrected3dAngle >= 100 && corrected3dAngle <= 125) {
    status = 'optimal'
    feedback = `Optimal EVF Catch (${corrected3dAngle}° in 3D, compensated for ${torsoRollDeg}° torso roll). Maximizes propulsive surface area without rotator cuff impingement.`
  } else if (corrected3dAngle > 125 && corrected3dAngle <= 145) {
    status = 'acceptable'
    feedback = `Acceptable catch (${corrected3dAngle}°), but elbow is beginning to drop. Anchor hand earlier.`
  } else if (corrected3dAngle > 145) {
    status = 'dropped_elbow'
    feedback = `Dropped elbow detected (${corrected3dAngle}°). Forearm is slipping water and pressing downward, increasing shoulder shear stress.`
  } else {
    status = 'over_flexed'
    feedback = `Over-flexed catch (${corrected3dAngle}°). Hand is pulling too close to chest, losing lever arm.`
  }

  return {
    raw2dAngle,
    corrected3dAngle,
    torsoRollDeg,
    status,
    feedback,
  }
}
